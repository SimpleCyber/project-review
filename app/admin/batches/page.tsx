"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy 
} from "firebase/firestore";
import { Batch } from "@/lib/types";
import { FaPlus, FaLock, FaUnlock, FaTrash, FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaEdit, FaTimes, FaSave } from "react-icons/fa";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [batchNum, setBatchNum] = useState(1);
  const [groupCount, setGroupCount] = useState(6);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editYear, setEditYear] = useState(new Date().getFullYear());
  const [editBatchNum, setEditBatchNum] = useState(1);
  const [editGroupCount, setEditGroupCount] = useState(6);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "batches"), orderBy("year", "desc"), orderBy("batchNumber", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
      setBatches(data);
    } catch (err) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const batchName = `${year} Batch ${batchNum}`;
      // Check if already exists
      if (batches.some(b => b.name === batchName)) {
        throw new Error("Batch with this name already exists.");
      }

      await addDoc(collection(db, "batches"), {
        name: batchName,
        year,
        batchNumber: batchNum,
        maxGroups: groupCount,
        isLocked: false,
        createdAt: Date.now(),
      });

      setName("");
      fetchBatches();
    } catch (err: any) {
      setError(err.message || "Failed to create batch.");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (batch: Batch) => {
    setEditingId(batch.id);
    setEditYear(batch.year);
    setEditBatchNum(batch.batchNumber);
    setEditGroupCount(batch.maxGroups || 6);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setUpdating(true);

    try {
      const batchName = `${editYear} Batch ${editBatchNum}`;
      
      await updateDoc(doc(db, "batches", editingId), {
        name: batchName,
        year: editYear,
        batchNumber: editBatchNum,
        maxGroups: editGroupCount,
      });

      setEditingId(null);
      fetchBatches();
    } catch (err: any) {
      setError(err.message || "Failed to update batch.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleLock = async (batchId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "batches", batchId), {
        isLocked: !currentStatus
      });
      setBatches(batches.map(b => b.id === batchId ? { ...b, isLocked: !currentStatus } : b));
    } catch (err) {
      console.error("Error toggling lock:", err);
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (!confirm("Are you sure? This will not delete students but they won't be able to edit submissions if this batch is gone.")) return;
    try {
      await deleteDoc(doc(db, "batches", batchId));
      setBatches(batches.filter(b => b.id !== batchId));
    } catch (err) {
      console.error("Error deleting batch:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manage Batches</h1>
        <p className="text-secondary">Create and control project submission windows for different batches.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Batch Form */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaPlus className="text-accent" /> New Batch
        </h2>
        <form onSubmit={handleCreateBatch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="label">Year</label>
            <input 
              type="number" 
              className="input" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))} 
              min={2020} max={2100}
              required
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="label">Batch Number (e.g. 1, 2)</label>
            <input 
              type="number" 
              className="input" 
              value={batchNum} 
              onChange={(e) => setBatchNum(parseInt(e.target.value))} 
              min={1}
              required
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="label">Total Groups (e.g. 10)</label>
            <input 
              type="number" 
              className="input" 
              value={groupCount} 
              onChange={(e) => setGroupCount(parseInt(e.target.value))} 
              min={1}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary h-[46px]" disabled={creating}>
            {creating ? <div className="spinner" /> : "Create Batch"}
          </button>
        </form>
        <p className="text-[10px] text-text-muted mt-4 uppercase font-bold tracking-widest">
          Currently configured for <span className="text-accent">{groupCount}</span> groups (B1 - B{groupCount})
        </p>
      </div>

      {/* Batches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="stat-card h-40 skeleton" />
          ))
        ) : batches.length === 0 ? (
          <div className="md:col-span-3 glass-card p-12 text-center text-text-muted italic">
            No batches created yet. Create one above to allow student registrations.
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className="stat-card flex flex-col justify-between min-h-[320px] group transition-all hover:border-accent/40">
              {editingId === batch.id ? (
                <form onSubmit={handleUpdateBatch} className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-accent">Editing Batch</h3>
                    <button type="button" onClick={cancelEditing} className="text-text-muted hover:text-rose-500">
                      <FaTimes size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-muted">Year</label>
                      <input 
                        type="number" 
                        className="input input-sm h-10" 
                        value={editYear} 
                        onChange={(e) => setEditYear(parseInt(e.target.value))} 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-text-muted">Batch #</label>
                      <input 
                        type="number" 
                        className="input input-sm h-10" 
                        value={editBatchNum} 
                        onChange={(e) => setEditBatchNum(parseInt(e.target.value))} 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Total Groups</label>
                    <input 
                      type="number" 
                      className="input input-sm h-10" 
                      value={editGroupCount} 
                      onChange={(e) => setEditGroupCount(parseInt(e.target.value))} 
                      required
                      min={1}
                    />
                  </div>
                  <div className="mt-auto pt-4">
                    <button type="submit" className="btn btn-primary btn-sm w-full gap-2 h-10" disabled={updating}>
                      {updating ? <div className="spinner" /> : <><FaSave size={14} /> Update Batch</>}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                        <FaCalendarAlt size={20} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(batch)}
                          className="w-8 h-8 rounded-lg bg-bg-primary border border-border flex items-center justify-center text-text-muted hover:text-accent transition-all"
                          title="Edit Batch"
                        >
                          <FaEdit size={14} />
                        </button>
                        <div className={`badge ${batch.isLocked ? "badge-danger" : "badge-success"}`}>
                          {batch.isLocked ? <><FaLock size={10} /> Locked</> : <><FaCheckCircle size={10} /> Open</>}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{batch.name}</h3>
                    <p className="text-sm text-text-muted">Created {new Date(batch.createdAt).toLocaleDateString()}</p>
                    <div className="mt-4 p-2 rounded-lg bg-bg-primary/50 border border-border/50">
                       <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Configuration</p>
                       <p className="text-sm font-semibold text-accent">{batch.maxGroups || 6} Groups Total</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleLock(batch.id, batch.isLocked)}
                      className={`btn flex-1 btn-sm ${batch.isLocked ? "btn-secondary" : "btn-danger"}`}
                    >
                      {batch.isLocked ? <><FaUnlock size={14} /> Unlock</> : <><FaLock size={14} /> Lock</>}
                    </button>
                    <button 
                      onClick={() => deleteBatch(batch.id)}
                      className="btn btn-secondary btn-sm text-rose-500 hover:text-rose-400"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="locked-banner bg-accent-light/30 border-accent/20">
        <FaExclamationCircle className="text-accent" />
        <p className="text-sm text-text-secondary">
          <strong>Pro Tip:</strong> Locking a batch prevents students in that batch from editing or submitting new projects. 
          Useful for hard deadlines.
        </p>
      </div>
    </div>
  );
}
