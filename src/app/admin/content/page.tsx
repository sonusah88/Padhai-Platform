'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Film,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  X,
} from 'lucide-react';
import { RecordedVideo, StudyMaterial } from '@/lib/types';
import {
  getAdminContentAction,
  uploadRecordedVideoAction,
  uploadStudyMaterialAction,
  deleteContentItemAction,
} from '@/lib/actions/content';
import { FileUploader } from '@/components/admin/file-uploader';
import { cn } from '@/lib/utils';

export default function AdminContentPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'materials' ? 'materials' : 'videos';

  const [activeTab, setActiveTab] = useState<'videos' | 'materials'>(initialTab);
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Video Form Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    durationMinutes: 45,
    subjectName: 'Mathematics',
    gradeName: 'Grade 10',
  });

  // Material Form Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileSizeBytes: 0,
    fileType: 'pdf',
    subjectName: 'Science',
    gradeName: 'Grade 10',
  });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getAdminContentAction();
      setVideos(data.videos);
      setMaterials(data.materials);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title || !videoFormData.videoUrl) return;

    const res = await uploadRecordedVideoAction({
      title: videoFormData.title,
      description: videoFormData.description,
      videoUrl: videoFormData.videoUrl,
      durationSeconds: videoFormData.durationMinutes * 60,
      subjectName: videoFormData.subjectName,
      gradeName: videoFormData.gradeName,
    });

    if (res.success && res.data) {
      setVideos([res.data, ...videos]);
      setIsVideoModalOpen(false);
      setVideoFormData({
        title: '',
        description: '',
        videoUrl: '',
        durationMinutes: 45,
        subjectName: 'Mathematics',
        gradeName: 'Grade 10',
      });
    } else {
      alert(res.error || 'Failed to upload video');
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFormData.title || !materialFormData.fileUrl) return;

    const res = await uploadStudyMaterialAction({
      title: materialFormData.title,
      description: materialFormData.description,
      fileUrl: materialFormData.fileUrl,
      fileSizeBytes: materialFormData.fileSizeBytes,
      fileType: materialFormData.fileType,
      subjectName: materialFormData.subjectName,
      gradeName: materialFormData.gradeName,
    });

    if (res.success && res.data) {
      setMaterials([res.data, ...materials]);
      setIsMaterialModalOpen(false);
      setMaterialFormData({
        title: '',
        description: '',
        fileUrl: '',
        fileSizeBytes: 0,
        fileType: 'pdf',
        subjectName: 'Science',
        gradeName: 'Grade 10',
      });
    } else {
      alert(res.error || 'Failed to upload material');
    }
  };

  const handleDelete = async (id: string, type: 'video' | 'material') => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    const res = await deleteContentItemAction(id, type);
    if (res.success) {
      if (type === 'video') {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      } else {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[hsl(var(--foreground))]">
            Content &amp; Material Management
          </h1>
          <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">
            Upload recorded lecture videos (VOD) and share syllabus PDF notes with students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'videos' ? (
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Film className="w-4 h-4" />
              <span>Upload Video Lecture</span>
            </button>
          ) : (
            <button
              onClick={() => setIsMaterialModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Study PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-3">
        <button
          onClick={() => setActiveTab('videos')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'videos'
              ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
              : 'text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))]'
          )}
        >
          <Film className="w-4 h-4" />
          <span>Recorded Videos (VOD) ({videos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'materials'
              ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
              : 'text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))]'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Study Materials &amp; PDFs ({materials.length})</span>
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'videos' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 p-12 text-center text-xs text-[hsl(var(--foreground-secondary))]">
              Loading recorded videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-3 p-12 text-center rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--foreground-secondary))] space-y-2">
              <Film className="w-8 h-8 text-[hsl(var(--foreground-tertiary))] mx-auto" />
              <p className="font-semibold text-sm text-[hsl(var(--foreground))]">No recorded videos yet</p>
              <p>Upload lecture recordings to make them available for students to review on-demand.</p>
            </div>
          ) : (
            videos.map((vid) => (
              <div
                key={vid.id}
                className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden shadow-xs hover:border-[hsl(var(--primary)/0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video relative bg-slate-900 overflow-hidden">
                    <img
                      src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=450'}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                      {Math.floor(vid.duration_seconds / 60)} min
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-xs font-bold text-[hsl(var(--foreground))] line-clamp-2">
                      {vid.title}
                    </h3>
                    <p className="text-[11px] text-[hsl(var(--foreground-secondary))] line-clamp-2">
                      {vid.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-[hsl(var(--border))] mt-3 pt-3 text-xs">
                  <span className="text-[11px] text-[hsl(var(--foreground-tertiary))]">
                    {vid.views_count} views
                  </span>
                  <button
                    onClick={() => handleDelete(vid.id, 'video')}
                    className="p-1.5 text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--foreground-secondary))]">
                  <th className="p-4 font-semibold">Document Title</th>
                  <th className="p-4 font-semibold">Format</th>
                  <th className="p-4 font-semibold">Size</th>
                  <th className="p-4 font-semibold">Downloads</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[hsl(var(--foreground-secondary))]">
                      Loading materials...
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[hsl(var(--foreground-secondary))]">
                      No study materials uploaded yet.
                    </td>
                  </tr>
                ) : (
                  materials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                      <td className="p-4 font-bold text-[hsl(var(--foreground))]">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
                          <span>{mat.title}</span>
                        </div>
                      </td>
                      <td className="p-4 uppercase font-mono text-[10px] text-[hsl(var(--foreground-secondary))]">
                        {mat.file_type}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[hsl(var(--foreground-secondary))]">
                        {mat.file_size_bytes ? `${(mat.file_size_bytes / (1024 * 1024)).toFixed(2)} MB` : '1.5 MB'}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[hsl(var(--foreground-secondary))]">
                        {mat.download_count}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] transition-colors"
                            title="Download / View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(mat.id, 'material')}
                            className="p-1.5 rounded-lg text-[hsl(var(--foreground-tertiary))] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Upload Recorded Video (VOD)</h2>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Lecture Title *</label>
                <input
                  type="text"
                  required
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  placeholder="e.g. Grade 10 Science: Optics Refraction Complete Lecture"
                  className="w-full px-3.5 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                  placeholder="Overview of topics covered in this video..."
                  className="w-full px-3.5 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] h-20 resize-none"
                />
              </div>

              {/* Supabase Storage Upload Component */}
              <FileUploader
                bucketName="videos"
                acceptedTypes="video/*"
                label="Select Video File or provide stream URL below"
                onUploadComplete={(url) => setVideoFormData({ ...videoFormData, videoUrl: url })}
              />

              <div>
                <label className="block font-semibold mb-1">Direct Video/Stream URL</label>
                <input
                  type="url"
                  value={videoFormData.videoUrl}
                  onChange={(e) => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })}
                  placeholder="https://... or auto-filled from storage above"
                  className="w-full px-3.5 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!videoFormData.title || !videoFormData.videoUrl}
                  className="px-5 py-2 font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg shadow-sm disabled:opacity-50"
                >
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Upload Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--border))]">
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Upload Study Material (PDF/Notes)</h2>
              <button onClick={() => setIsMaterialModalOpen(false)} className="text-[hsl(var(--foreground-tertiary))] hover:text-[hsl(var(--foreground))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={materialFormData.title}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                  placeholder="e.g. Trigonometry Formula Cheat Sheet.pdf"
                  className="w-full px-3.5 py-2 bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground))]"
                />
              </div>

              {/* Supabase Storage Upload Component */}
              <FileUploader
                bucketName="study_materials"
                acceptedTypes=".pdf,.doc,.docx,.zip,.txt"
                label="Upload Document File"
                onUploadComplete={(url, meta) =>
                  setMaterialFormData({
                    ...materialFormData,
                    fileUrl: url,
                    fileSizeBytes: meta.size,
                    fileType: meta.type || 'pdf',
                  })
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--muted))] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!materialFormData.title || !materialFormData.fileUrl}
                  className="px-5 py-2 font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg shadow-sm disabled:opacity-50"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
