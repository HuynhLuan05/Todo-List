import { Edit2, Trash2, Calendar, CheckSquare, Square } from 'lucide-react';
import type { Todo } from '../types/todo';

export interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const isCompleted = todo.status === 'completed';

  // Format the due date to a readable local string
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Determine the urgency status of the due date
  const getDueStatus = () => {
    if (!todo.dueDate || isCompleted) return { label: 'on-time', class: 'text-page-dim' };

    const now = new Date();
    const dueDate = new Date(todo.dueDate);

    // Set times to midnight to compare days correctly
    now.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Quá hạn', class: 'text-status-danger font-semibold' };
    } else if (diffDays === 0) {
      return { label: 'Hôm nay!', class: 'text-status-warning font-semibold animate-pulse' };
    } else if (diffDays === 1) {
      return { label: 'Ngày mai', class: 'text-status-warning font-medium' };
    } else {
      return { label: `Còn ${diffDays} ngày`, class: 'text-page-muted' };
    }
  };

  const dueStatus = getDueStatus();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
        isCompleted
          ? 'bg-page-card/40 border-page-card-border/50 opacity-60'
          : 'bg-page-card border-page-card-border hover:border-page-card-border-hover hover:bg-page-card-hover shadow-page-box hover:shadow-page-box-hover'
      }`}
    >
      {/* Checkbox and Content */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-1 focus:outline-none transition-transform active:scale-90"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted ? (
            <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
          ) : (
            <Square className="w-5 h-5 text-page-dim hover:text-brand-violet" />
          )}
        </button>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3
              className={`text-base font-semibold truncate leading-snug ${
                isCompleted ? 'text-page-dim line-through font-normal' : 'text-page-text'
              }`}
            >
              {todo.title}
            </h3>
            {isCompleted ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Hoàn thành
              </span>
            ) : dueStatus.label === 'Quá hạn' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-status-danger bg-status-danger-bg border border-status-danger/20 px-2 py-0.5 rounded-full">
                Trễ hạn
              </span>
            ) : null}
          </div>

          {todo.description && (
            <p
              className={`text-sm leading-relaxed line-clamp-2 ${
                isCompleted ? 'text-page-dim' : 'text-page-muted'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Metadata: Created At / Due Date */}
          <div className="flex items-center flex-wrap gap-4 mt-1">
            {todo.dueDate && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-page-dim" />
                <span className="text-page-dim">Hạn:</span>
                <span className={dueStatus.class}>{formatDueDate(todo.dueDate)}</span>
                {!isCompleted && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 ${dueStatus.class}`}>
                    {dueStatus.label}
                  </span>
                )}
              </div>
            )}
            <div className="text-[11px] text-page-dim">
              Tạo lúc: {new Date(todo.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t border-page-card-border/50 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
        <button
          onClick={() => onEdit(todo)}
          className="p-2 text-page-dim hover:text-page-text hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
          title="Sửa công việc"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-page-dim hover:text-status-danger hover:bg-status-danger-bg rounded-xl transition-all"
          title="Xóa công việc"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
