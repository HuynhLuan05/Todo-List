import { useState, useEffect } from 'react';
import { X, Calendar, FileText, CheckSquare, Loader2 } from 'lucide-react';
import type { Todo } from '../types/todo';

export interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; dueDate: string | null }) => Promise<void>;
  todo?: Todo | null;
  isSubmitting?: boolean;
}

export default function TodoModal({ isOpen, onClose, onSubmit, todo, isSubmitting = false }: TodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync state with selected todo when modal opens or todo changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    } else {
      // Clear fields for creation mode
      setTitle('');
      setDescription('');
      setDueDate('');
    }
    setValidationError('');
  }, [todo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Tiêu đề công việc là bắt buộc');
      return;
    }

    if (title.length > 100) {
      setValidationError('Tiêu đề không được vượt quá 100 ký tự');
      return;
    }

    if (description.length > 500) {
      setValidationError('Mô tả không được vượt quá 500 ký tự');
      return;
    }

    try {
      // Convert local date (YYYY-MM-DD) to ISO-8601 string at UTC midnight
      const isoDate = dueDate ? new Date(dueDate).toISOString() : null;
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dueDate: isoDate,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu công việc');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
      {/* Modal card */}
      <div className="bg-slate-900/90 border border-white/10 w-full max-w-lg rounded-2xl p-7 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-semibold font-heading text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-violet" />
            {todo ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc Mới'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {validationError && (
            <div className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg">
              {validationError}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="todo-title" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="todo-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề công việc..."
                disabled={isSubmitting}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="todo-desc" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Mô tả
            </label>
            <textarea
              id="todo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết công việc..."
              rows={3}
              disabled={isSubmitting}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="todo-due" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Hạn chót (Due date)
            </label>
            <input
              id="todo-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/20 outline-none transition-all color-scheme-dark disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-top border-white/5 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang Lưu...
                </>
              ) : todo ? (
                'Cập Nhật'
              ) : (
                'Thêm Mới'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
