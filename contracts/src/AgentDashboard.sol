// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title AgentDashboard
 * @notice Dashboard contract for creating and managing persistent on-chain AI agents
 *         on Ritual Chain using the 0x0820 Persistent Agent precompile.
 * @dev This contract acts as a registry and lifecycle manager for agents.
 *      Each agent spawn forwards encoded parameters to the native precompile.
 */
contract AgentDashboard {
    /* ════════════════════════════════════════════
     *  Constants
     * ════════════════════════════════════════════ */

    /// @notice Address of the Persistent Agent precompile on Ritual Chain
    address constant PERSISTENT_AGENT = address(0x0820);

    /* ════════════════════════════════════════════
     *  Types
     * ════════════════════════════════════════════ */

    enum AgentStatus {
        Spawning,
        Active,
        Paused,
        Checkpointing,
        Reviving,
        Terminated
    }

    struct AgentInfo {
        bytes32 agentId;
        address owner;
        AgentStatus status;
        string soul;
        string model;
        uint256 createdAt;
        uint256 lastActiveAt;
        string latestCid;
    }

    /* ════════════════════════════════════════════
     *  State
     * ════════════════════════════════════════════ */

    mapping(bytes32 => AgentInfo) public agents;
    mapping(address => bytes32[]) public ownerAgents;
    uint256 public totalAgents;

    /* ════════════════════════════════════════════
     *  Events
     * ════════════════════════════════════════════ */

    event AgentSpawned(
        bytes32 indexed agentId,
        address indexed owner,
        string soul
    );
    event AgentPaused(bytes32 indexed agentId);
    event AgentResumed(bytes32 indexed agentId);
    event AgentCheckpointed(bytes32 indexed agentId, string cid);
    event AgentRevived(bytes32 indexed agentId, string cid);
    event AgentTerminated(bytes32 indexed agentId);
    event AgentResult(bytes32 indexed agentId, bytes result);

    /* ════════════════════════════════════════════
     *  Modifiers
     * ════════════════════════════════════════════ */

    modifier onlyAgentOwner(bytes32 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }

    modifier agentExists(bytes32 agentId) {
        require(agents[agentId].owner != address(0), "Agent does not exist");
        _;
    }

    /* ════════════════════════════════════════════
     *  Core Functions
     * ════════════════════════════════════════════ */

    /**
     * @notice Spawn a new persistent agent via the 0x0820 precompile.
     * @param soul          Agent identity / purpose description
     * @param systemPrompt  System prompt for the LLM
     * @param constraints   Behavioral constraints
     * @param messagesJson  Initial messages (JSON array)
     * @param model         Model identifier (e.g. "ritual-llm-v1")
     * @param maxTokens     Maximum output tokens
     * @param memoryType    0 = ephemeral, 1 = persistent
     * @param initialKnowledge  Seed knowledge for the agent
     * @param storageProvider   0 = IPFS, 1 = GCS, 2 = HuggingFace
     * @param checkpointInterval Auto-checkpoint interval in seconds
     * @param temperature   0-100 (maps to 0.0-1.0)
     * @param convoHistory  Whether to maintain conversation history
     * @param restoreFromCid CID to restore from (empty for new agent)
     * @return agentId      Unique identifier for the spawned agent
     */
    function spawnAgent(
        string calldata soul,
        string calldata systemPrompt,
        string calldata constraints,
        string calldata messagesJson,
        string calldata model,
        uint256 maxTokens,
        uint8 memoryType,
        string calldata initialKnowledge,
        uint8 storageProvider,
        uint256 checkpointInterval,
        uint8 temperature,
        bool convoHistory,
        string calldata restoreFromCid
    ) external payable returns (bytes32 agentId) {
        // Generate unique agent ID
        agentId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, totalAgents)
        );

        // Encode all 25 fields for the precompile
        bytes memory precompileInput = abi.encode(
            agentId,           // 1: jobId
            soul,              // 2: soul
            systemPrompt,      // 3: systemPrompt
            constraints,       // 4: constraints
            messagesJson,      // 5: messagesJson
            model,             // 6: model
            maxTokens,         // 7: maxTokens
            memoryType,        // 8: memoryType
            initialKnowledge,  // 9: initialKnowledge
            storageProvider,   // 10: storageProvider
            "",                // 11: storageRef (auto-assigned)
            checkpointInterval,// 12: checkpointInterval
            uint256(0),        // 13: schedulerEnabled
            "",                // 14: scheduleCron
            "[]",              // 15: allowedTools
            "[]",              // 16: httpWhitelist
            msg.value,         // 17: fundingAmount
            uint256(500000),   // 18: maxGasPerAction
            false,             // 19: requireTEE
            uint256(0),        // 20: zkMode
            uint256(0),        // 21: privacyLevel
            temperature,       // 22: temperature
            restoreFromCid,    // 23: restoreFromCid
            convoHistory,      // 24: convoHistory
            uint256(1000000)   // 25: callbackGasLimit
        );

        // Call the persistent agent precompile
        (bool success, ) = PERSISTENT_AGENT.call(precompileInput);
        require(success, "Precompile call failed");

        // Register the agent
        agents[agentId] = AgentInfo({
            agentId: agentId,
            owner: msg.sender,
            status: AgentStatus.Spawning,
            soul: soul,
            model: model,
            createdAt: block.timestamp,
            lastActiveAt: block.timestamp,
            latestCid: restoreFromCid
        });

        ownerAgents[msg.sender].push(agentId);
        totalAgents++;

        emit AgentSpawned(agentId, msg.sender, soul);
    }

    /**
     * @notice Callback from the precompile when agent produces a result.
     * @dev Called by the Ritual Chain runtime — not by external users.
     */
    function onPersistentAgentResult(
        bytes32 agentId,
        bytes calldata result
    ) external {
        // In production, verify msg.sender == PERSISTENT_AGENT
        agents[agentId].status = AgentStatus.Active;
        agents[agentId].lastActiveAt = block.timestamp;

        emit AgentResult(agentId, result);
    }

    /* ════════════════════════════════════════════
     *  Lifecycle Management
     * ════════════════════════════════════════════ */

    function pauseAgent(bytes32 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(
            agents[agentId].status == AgentStatus.Active,
            "Agent not active"
        );
        agents[agentId].status = AgentStatus.Paused;
        agents[agentId].lastActiveAt = block.timestamp;
        emit AgentPaused(agentId);
    }

    function resumeAgent(bytes32 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(
            agents[agentId].status == AgentStatus.Paused,
            "Agent not paused"
        );
        agents[agentId].status = AgentStatus.Active;
        agents[agentId].lastActiveAt = block.timestamp;
        emit AgentResumed(agentId);
    }

    function checkpointAgent(bytes32 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        agents[agentId].status = AgentStatus.Checkpointing;
        agents[agentId].lastActiveAt = block.timestamp;
        // The precompile handles actual state persistence
        emit AgentCheckpointed(agentId, agents[agentId].latestCid);
    }

    function reviveAgent(bytes32 agentId, string calldata cid)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        agents[agentId].status = AgentStatus.Reviving;
        agents[agentId].latestCid = cid;
        agents[agentId].lastActiveAt = block.timestamp;
        emit AgentRevived(agentId, cid);
    }

    function terminateAgent(bytes32 agentId)
        external
        onlyAgentOwner(agentId)
        agentExists(agentId)
    {
        require(
            agents[agentId].status != AgentStatus.Terminated,
            "Already terminated"
        );
        agents[agentId].status = AgentStatus.Terminated;
        agents[agentId].lastActiveAt = block.timestamp;
        emit AgentTerminated(agentId);
    }

    /* ════════════════════════════════════════════
     *  View Functions
     * ════════════════════════════════════════════ */

    function getAgentCount(address owner) external view returns (uint256) {
        return ownerAgents[owner].length;
    }

    function getAgentIds(address owner)
        external
        view
        returns (bytes32[] memory)
    {
        return ownerAgents[owner];
    }

    function getAgentInfo(bytes32 agentId)
        external
        view
        returns (AgentInfo memory)
    {
        return agents[agentId];
    }
}
