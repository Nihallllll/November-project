import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, ArrowLeft, Moon, Sun, Trash2, Home } from 'lucide-react';
import { flowsApi } from '../api/flows';
import { nodeTypes } from '../components/nodes/';
import NodePalette from '../components/canvas/NodePalette';
import NodeInspector from '../components/canvas/NodeInspector';
import CustomEdge from '../components/canvas/CustomEdge';
import { useTheme } from '../components/ThemeProvider';
import { toast } from 'sonner';
import { isValidConnection } from '../utils/nodeConnectionRules';
import UserIndicator from '../components/UserIndicator';

export default function CanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Custom edge types with delete functionality
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      default: CustomEdge,
    }),
    []
  );

  // Handle edge deletion
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    toast.success('Connection removed');
  }, [setEdges]);

  useEffect(() => {
    if (id) {
      loadFlow(id);
    }
  }, [id]);

  const loadFlow = async (flowId: string) => {
    try {
      const flow = await flowsApi.get(flowId);
      setFlowName(flow.name);
      
      if (flow.json?.nodes) {
        const flowNodes = flow.json.nodes.map((node: any, index: number) => ({
          id: node.id,
          type: node.type,
          position: node.position || { x: 100 + index * 300, y: 100 },
          data: node.data || {},
        }));
        setNodes(flowNodes);
      }

      if (flow.json?.connections) {
        const flowEdges = flow.json.connections.map((conn: any, index: number) => ({
          id: `e${index}`,
          type: 'default',
          source: conn.from,
          target: conn.to,
          animated: true,
          style: { stroke: 'hsl(263 70% 65%)', strokeWidth: 2 },
          data: { onDelete: handleEdgeDelete }
        }));
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Failed to load flow:', error);
      toast.error('Failed to load flow');
    }
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        toast.error('Invalid connection: Node not found');
        return;
      }

      // Validate connection
      const validation = isValidConnection(
        sourceNode.type || '',
        params.sourceHandle || 'output',
        targetNode.type || '',
        params.targetHandle || 'input',
        edges
      );

      if (!validation.valid) {
        toast.error(validation.reason || 'Invalid connection');
        return;
      }

      // Add the edge
      setEdges((eds) => addEdge({
        ...params,
        type: 'default',
        animated: true,
        style: { stroke: 'hsl(263 70% 65%)', strokeWidth: 2 },
        data: { onDelete: handleEdgeDelete }
      }, eds));

      toast.success('Connection created');
    },
    [nodes, edges, setEdges, handleEdgeDelete]
  );

  const deleteSelectedNodes = useCallback(() => {
    const selectedNodesList = nodes.filter(node => node.selected);
    if (selectedNodesList.length === 0) return;
    
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      return sourceNode && targetNode && !sourceNode.selected && !targetNode.selected;
    }));
    
    setSelectedNode(null);
    toast.success('Deleted selected nodes');
  }, [nodes, setNodes, setEdges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.replace(/_/g, ' ').toUpperCase() },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const flowJson = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          data: node.data,
          position: node.position,
        })),
        connections: edges.map(edge => ({
          from: edge.source,
          to: edge.target,
          condition: edge.data?.condition,
        })),
      };

      // Extract schedule from schedule nodes (if any)
      const scheduleNode = nodes.find(node => node.type === 'schedule');
      let schedule = null;
      
      if (scheduleNode?.data.scheduleType === 'interval' && scheduleNode?.data.interval) {
        schedule = scheduleNode.data.interval;
      } else if (scheduleNode?.data.scheduleType === 'cron' && scheduleNode?.data.cronExpression) {
        schedule = scheduleNode.data.cronExpression;
      }

      if (id) {
        await flowsApi.update(id, { name: flowName, json: flowJson, schedule });
        toast.success('Flow saved!');
      } else {
        const newFlow = await flowsApi.create({
          name: flowName,
          json: flowJson,
          isActive: false,
          schedule,
        });
        navigate(`/canvas/${newFlow.id}`, { replace: true });
        toast.success('Flow created!');
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!id) {
      toast.error('Please save the flow first');
      return;
    }

    try {
      await flowsApi.runFlow(id);
      toast.success('Flow execution started!');
    } catch (error) {
      console.error('Failed to run flow:', error);
      toast.error('Failed to run flow');
    }
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data } : node
      )
    );
  }, [setNodes]);

  return (
    <div className="h-screen w-full bg-background relative overflow-hidden flex">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      {/* Left Sidebar - Node Palette */}
      <NodePalette />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top toolbar with glassmorphism */}
        <div className="glass border-b border-border/50 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                title="Go to Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="text-xl font-bold text-gradient bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 py-1"
                placeholder="Workflow Canvas"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <UserIndicator />
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={deleteSelectedNodes}
                disabled={!nodes.some(n => n.selected)}
                className="flex items-center gap-2 px-4 py-2 glass border border-border/50 hover:border-primary/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 glass border border-border/50 hover:border-primary/50 rounded-lg transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-lg transition-all glow-primary"
              >
                <Play className="w-4 h-4" />
                Run Workflow
              </button>
            </div>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-transparent"
            defaultEdgeOptions={{
              animated: true,
              style: { strokeWidth: 2 }
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="hsl(263 70% 65% / 0.2)"
            />
            <Controls 
              className="glass border border-border/50 rounded-lg overflow-hidden"
            />
            <MiniMap 
              className="glass border border-border/50 rounded-lg overflow-hidden"
              nodeColor={() => 'hsl(263 70% 65%)'}
              maskColor="hsl(240 10% 3.9% / 0.8)"
            />
          </ReactFlow>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar - Node Inspector */}
      {selectedNode && (
        <NodeInspector
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={handleNodeUpdate}
        />
      )}
    </div>
  );
}
