
import React, { useState, FormEvent, useEffect } from 'react';
import { CoinDetail } from '../types';

interface AdminPanelProps {
  onNavigate: (screen: 'game') => void;
  onProjectsUpdated: () => void;
}

// Reusable Input Field Component
const IconInputField: React.FC<{
    id: string, 
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, 
    type?: string, 
    required?: boolean, 
    placeholder?: string,
    icon: React.ReactNode,
    as?: 'input' | 'textarea',
    disabled?: boolean,
}> = ({ id, label, value, onChange, type = 'text', required = true, placeholder, icon, as = 'input', disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {as === 'input' ? (
                <>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>
                    <input type={type} id={id} value={value} onChange={onChange} required={required} disabled={disabled} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100" placeholder={placeholder} />
                </>
            ) : (
                <textarea id={id} value={value} onChange={onChange} required={required} disabled={disabled} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100" placeholder={placeholder} />
            )}
        </div>
    </div>
);

// Edit Modal Component
const EditProjectModal: React.FC<{
    project: CoinDetail;
    onClose: () => void;
    onSave: (projectId: string, projectData: any) => Promise<void>;
    isSaving: boolean;
}> = ({ project, onClose, onSave, isSaving }) => {
    const [formData, setFormData] = useState({
        name: project.name || '',
        logo: project.logo || '',
        description: project.description || '',
        website: project.links?.website?.[0] || '',
        whitepaper: project.whitepaper?.link || '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(project.id, formData);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 scale-95 animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
                 <h3 className="text-2xl font-bold text-gray-800 mb-1">Edit Project</h3>
                 <p className="text-gray-500 mb-6">Editing <span className="font-semibold">{project.name} ({project.symbol})</span></p>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <IconInputField id="name" label="Project Name" value={formData.name} onChange={handleChange} icon={<span />} />
                    <IconInputField id="logo" label="Logo URL" value={formData.logo} onChange={handleChange} type="url" icon={<span />} />
                    <IconInputField id="description" label="Description" value={formData.description} onChange={handleChange} as="textarea" icon={<span />} />
                    <IconInputField id="website" label="Website URL" value={formData.website} onChange={handleChange} type="url" icon={<span />} />
                    <IconInputField id="whitepaper" label="Whitepaper URL" value={formData.whitepaper} onChange={handleChange} type="url" icon={<span />} />
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full hover:scale-105 transform transition-transform duration-200 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                 </form>
            </div>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate, onProjectsUpdated }) => {
    // Form state
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [logo, setLogo] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [whitepaper, setWhitepaper] = useState('');
    const [isHighlightedOnCreate, setIsHighlightedOnCreate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    
    // Project list state
    const [projects, setProjects] = useState<CoinDetail[]>([]);
    const [listIsLoading, setListIsLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
    const [editingProject, setEditingProject] = useState<CoinDetail | null>(null);
    
    const fetchProjects = async () => {
        setListIsLoading(true);
        setListError(null);
        try {
            const response = await fetch('/api/admin');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch projects.');
            setProjects(data.sort((a: CoinDetail, b: CoinDetail) => (a.name > b.name ? 1 : -1)));
        } catch (err: any) {
            setListError(err.message);
        } finally {
            setListIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);
    
    const clearForm = () => {
        setName(''); setSymbol(''); setLogo(''); setDescription('');
        setWebsite(''); setWhitepaper(''); setIsHighlightedOnCreate(false);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, symbol, logo, description, website, whitepaper, isHighlighted: isHighlightedOnCreate }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);
            setFormSuccess(`Project "${name}" added successfully!`);
            clearForm();
            await fetchProjects();
            onProjectsUpdated();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHighlightToggle = async (projectId: string, action: 'highlight' | 'unhighlight') => {
        setUpdatingProjectId(projectId);
        try {
            const response = await fetch('/api/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, action }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Failed to ${action} project.`);
            await fetchProjects();
            onProjectsUpdated();
        } catch (err: any) { setListError(err.message); } finally { setUpdatingProjectId(null); }
    };

    const handleDelete = async (projectId: string, projectName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) return;
        setUpdatingProjectId(projectId);
        try {
            const response = await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Failed to delete project.`);
            await fetchProjects();
            onProjectsUpdated();
        } catch (err: any) { setListError(err.message); } finally { setUpdatingProjectId(null); }
    };

    const handleSaveChanges = async (projectId: string, projectData: any) => {
        setUpdatingProjectId(projectId);
        setListError(null);
        try {
            const response = await fetch('/api/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, projectData }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update project.');
            setEditingProject(null);
            await fetchProjects();
            onProjectsUpdated();
        } catch (err: any) {
            setListError(`Failed to update ${projectData.name}: ${err.message}`);
        } finally {
            setUpdatingProjectId(null);
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-slide-in-up">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 mb-2">Admin Panel</h2>
                    <p className="text-lg text-gray-600 mb-8">Add, view, and manage projects in the HODL or DUMP queue.</p>
                    <details open className="group"><summary className="text-xl font-bold text-gray-800 cursor-pointer list-none group-hover:text-purple-600"><span className="group-open:hidden">&#9654;</span><span className="hidden group-open:inline-block">&#9660;</span> Add New Project</summary><form onSubmit={handleFormSubmit} className="space-y-6 mt-4 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><IconInputField id="name" label="Project Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Fito Coin" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2m0 0V3m0 0h.01" /></svg>} /><IconInputField id="symbol" label="Symbol" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g., FTO" disabled={isSubmitting} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} /></div><IconInputField id="logo" label="Logo URL" value={logo} onChange={e => setLogo(e.target.value)} type="url" placeholder="https://example.com/logo.png" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} /><div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="A short, compelling description of the project." /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><IconInputField id="website" label="Website URL" value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://example.com" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m9 9a9 9 0 009-9" /></svg>} /><IconInputField id="whitepaper" label="Whitepaper URL" value={whitepaper} onChange={e => setWhitepaper(e.target.value)} type="url" placeholder="https://example.com/whitepaper.pdf" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} /></div><div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200"><div className="flex items-center h-5"><input id="isHighlighted" type="checkbox" checked={isHighlightedOnCreate} onChange={(e) => setIsHighlightedOnCreate(e.target.checked)} className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded" /></div><div className="ml-3 text-sm"><label htmlFor="isHighlighted" className="font-medium text-gray-800">Highlight Project on Creation</label><p className="text-gray-600">Promote this project. It will appear first in the queue for 24 hours.</p></div></div>{formSuccess && <div className="p-3 bg-green-100 text-green-800 border-l-4 border-green-500 rounded-r-lg">{formSuccess}</div>}{formError && <div className="p-3 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-r-lg">{formError}</div>}<div className="flex justify-end pt-4"><button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Add Project'}</button></div></form></details>
                    <hr className="my-8 border-gray-200" />
                    <div><h3 className="text-xl font-bold text-gray-800 mb-4">Manage Existing Projects ({projects.length})</h3>{listError && <div className="p-3 bg-red-100 text-red-800 border-l-4 border-red-500 rounded-r-lg mb-4">{listError}</div>}<div className="space-y-3">{listIsLoading ? (<p>Loading projects...</p>) : projects.length === 0 ? (<p className="text-gray-500 text-center py-4">No custom projects have been added yet.</p>) : (projects.map(proj => {const isHighlighted = proj.highlightedUntil ? proj.highlightedUntil > Date.now() : false; const isUpdating = updatingProjectId === proj.id; return (<div key={proj.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4"><img src={proj.logo} alt={proj.name} className="w-10 h-10 rounded-full" /><div className="flex-grow text-center sm:text-left"><p className="font-bold text-gray-800">{proj.name} ({proj.symbol})</p>{isHighlighted ? (<span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Highlighted</span>) : (<span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Standard</span>)}</div><div className="flex items-center space-x-2 flex-shrink-0">{isHighlighted ? (<button onClick={() => handleHighlightToggle(proj.id, 'unhighlight')} disabled={isUpdating} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 transition-colors">Unhighlight</button>) : (<button onClick={() => handleHighlightToggle(proj.id, 'highlight')} disabled={isUpdating} className="px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 rounded-md disabled:opacity-50 transition-all">Highlight</button>)}<button onClick={() => setEditingProject(proj)} disabled={isUpdating} className="p-2 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-md disabled:opacity-50 transition-colors" aria-label="Edit project"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button><button onClick={() => handleDelete(proj.id, proj.name)} disabled={isUpdating} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-md disabled:opacity-50 transition-colors" aria-label="Delete project"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button></div></div>)}))}</div></div>
                    <div className="mt-12 text-center"><button onClick={() => onNavigate('game')} className="text-purple-600 hover:text-purple-800 font-semibold">&larr; Back to the Game</button></div>
                </div>
            </div>
            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSave={handleSaveChanges}
                    isSaving={updatingProjectId === editingProject.id}
                />
            )}
        </>
    );
};

export default AdminPanel;
