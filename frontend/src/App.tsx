import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, ArrowUpDown, CheckCircle2, Clock, 
  Loader2, ChevronLeft, ChevronRight, ListTodo, RotateCcw,
  Sun, Moon
} from 'lucide-react';
import { todoApi } from './services/api';
import type { Todo, TodoFilters, Pagination } from './types/todo';
import TodoCard from './components/TodoCard';
import TodoModal from './components/TodoModal';
import Toast from './components/Toast';
import type { ToastType } from './components/Toast';

export default function App() {
  // Theme state: Load preference from localStorage or default to dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark'; // default
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State variables
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Global Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    percentCompleted: 0,
  });

  // Filter & Query States
  const [filters, setFilters] = useState<TodoFilters>({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  // UI Control States
  const [searchTerm, setSearchTerm] = useState(''); // local input state for debouncing
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // 1. Fetch Todos based on current filters
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await todoApi.getTodos(filters);
      if (response.success) {
        setTodos(response.data);
        setPagination(response.pagination);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể tải danh sách công việc', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 2. Fetch Global Stats (Total, Pending, Completed) using lightweight count requests
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      // Query completed and pending total counts using limit=1 (returns pagination.totalCount)
      const [completedRes, pendingRes] = await Promise.all([
        todoApi.getTodos({ status: 'completed', page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
        todoApi.getTodos({ status: 'pending', page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      const completed = completedRes.pagination.totalCount;
      const pending = pendingRes.pagination.totalCount;
      const total = completed + pending;
      const percentCompleted = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ total, completed, pending, percentCompleted });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch todos and stats when filters change
  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  // 3. Debounce search input typing (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Toggle Todo completed status
  const handleToggleTodo = async (id: string) => {
    try {
      const res = await todoApi.toggleTodoStatus(id);
      if (res.success) {
        const isNowCompleted = res.data.status === 'completed';
        showToast(
          isNowCompleted ? 'Đã đánh dấu hoàn thành công việc' : 'Đã đánh dấu chưa hoàn thành công việc',
          'success'
        );
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      showToast('Không thể cập nhật trạng thái công việc', 'error');
    }
  };

  // Edit Todo trigger - Open modal
  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  // Delete Todo
  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) return;

    try {
      const res = await todoApi.deleteTodo(id);
      if (res.success) {
        showToast('Đã xóa công việc thành công', 'success');
        // Reset page if it was the last item on the page
        if (todos.length === 1 && filters.page > 1) {
          setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchTodos();
        }
        fetchStats();
      }
    } catch (err) {
      showToast('Không thể xóa công việc này', 'error');
    }
  };

  // Modal Form submission handler (Add or Update)
  const handleModalSubmit = async (data: { title: string; description: string; dueDate: string | null }) => {
    setIsSubmitting(true);
    try {
      if (selectedTodo) {
        // Edit mode
        const res = await todoApi.updateTodo(selectedTodo.id, data);
        if (res.success) {
          showToast('Cập nhật công việc thành công', 'success');
          fetchTodos();
          fetchStats();
        }
      } else {
        // Create mode
        const res = await todoApi.createTodo(data);
        if (res.success) {
          showToast('Tạo công việc mới thành công', 'success');
          // setFilters triggers useEffect → fetchTodos + fetchStats automatically
          setFilters((prev) => ({ ...prev, page: 1 }));
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      throw err; // propagated to modal to show validation error inside form
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    });
    showToast('Đã thiết lập lại bộ lọc', 'info');
  };

  return (
    <main className="container mx-auto flex-1 max-w-4xl py-12 px-4 sm:px-6">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header Panel with Theme Toggle */}
      <div className="flex flex-col items-center text-center mb-10 relative">
        <button
          onClick={toggleTheme}
          className="absolute right-0 top-0 p-3 bg-page-card border border-page-card-border rounded-xl text-page-muted hover:text-page-text shadow-page-box hover:shadow-page-box-hover hover:scale-105 active:scale-95 transition-all"
          title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>

        <div className="bg-brand-violet/10 border border-brand-violet/20 p-2.5 rounded-2xl mb-4">
          <ListTodo className="w-8 h-8 text-brand-violet" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-page-text via-page-text to-page-muted bg-clip-text text-transparent">
          Quản Lý Công Việc
        </h1>
        <p className="text-page-muted text-sm sm:text-base mt-2 font-medium">
          Todo List hiện đại, bóng bẩy với tối ưu hoá hiệu năng
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total stats */}
        <div className="bg-page-card border border-page-card-border backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 shadow-page-box hover:shadow-page-box-hover transition-all">
          <div className="bg-brand-indigo/10 p-3 rounded-xl">
            <ListTodo className="w-6 h-6 text-brand-indigo" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-heading text-page-text">
              {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-page-dim" /> : stats.total}
            </span>
            <span className="text-xs text-page-muted font-semibold uppercase tracking-wider">Tổng công việc</span>
          </div>
        </div>

        {/* Pending stats */}
        <div className="bg-page-card border border-page-card-border backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 shadow-page-box hover:shadow-page-box-hover transition-all">
          <div className="bg-status-warning-bg p-3 rounded-xl border border-status-warning/10">
            <Clock className="w-6 h-6 text-status-warning" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-heading text-status-warning">
              {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-page-dim" /> : stats.pending}
            </span>
            <span className="text-xs text-page-muted font-semibold uppercase tracking-wider">Đang chờ xử lý</span>
          </div>
        </div>

        {/* Completed stats with percentage indicator */}
        <div className="bg-page-card border border-page-card-border backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 shadow-page-box hover:shadow-page-box-hover transition-all relative overflow-hidden">
          <div className="bg-status-success-bg p-3 rounded-xl border border-status-success/10">
            <CheckCircle2 className="w-6 h-6 text-status-success" />
          </div>
          <div className="flex flex-col z-10">
            <span className="text-2xl font-bold font-heading text-status-success flex items-baseline gap-1.5">
              {isStatsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-page-dim" />
              ) : (
                <>
                  {stats.completed}
                  <span className="text-xs font-semibold text-status-success/60 font-sans">({stats.percentCompleted}%)</span>
                </>
              )}
            </span>
            <span className="text-xs text-page-muted font-semibold uppercase tracking-wider">Đã hoàn thành</span>
          </div>

          {/* Progress bar in background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${stats.percentCompleted}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Add Button */}
      <div className="bg-page-card border border-page-card-border backdrop-blur-md rounded-3xl p-5 flex flex-col gap-4 shadow-page-box mb-6">
        {/* Row 1: Search box */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-page-dim" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/5 dark:bg-black/25 border border-page-card-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-page-text placeholder-page-dim focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/10 outline-none transition-all"
          />
        </div>

        {/* Row 2: Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between flex-wrap">
          {/* Left: Filters & Sorters */}
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            {/* Status select */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any, page: 1 }))}
              className="bg-black/5 dark:bg-black/25 border border-page-card-border rounded-xl px-3.5 py-2.5 text-sm text-page-muted focus:border-brand-violet outline-none transition-all min-w-[140px] flex-1 sm:flex-none"
            >
              <option value="" className="bg-page-card text-page-text">Tất cả trạng thái</option>
              <option value="pending" className="bg-page-card text-page-text">Chưa hoàn thành</option>
              <option value="completed" className="bg-page-card text-page-text">Đã hoàn thành</option>
            </select>

            {/* Sort field select */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
              className="bg-black/5 dark:bg-black/25 border border-page-card-border rounded-xl px-3.5 py-2.5 text-sm text-page-muted focus:border-brand-violet outline-none transition-all min-w-[140px] flex-1 sm:flex-none"
            >
              <option value="createdAt" className="bg-page-card text-page-text">Sắp xếp: Ngày tạo</option>
              <option value="dueDate" className="bg-page-card text-page-text">Sắp xếp: Hạn chót</option>
              <option value="title" className="bg-page-card text-page-text">Sắp xếp: Tên chữ cái</option>
            </select>

            {/* Sort order toggle button */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                  page: 1,
                }))
              }
              className="p-3 bg-black/5 dark:bg-black/25 border border-page-card-border rounded-xl hover:bg-black/10 dark:hover:bg-white/5 text-page-dim hover:text-page-text transition-all shrink-0"
              title="Đổi chiều sắp xếp"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Reset filters button */}
            {(searchTerm || filters.status || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
              <button
                onClick={handleResetFilters}
                className="p-3 bg-status-danger-bg border border-status-danger/10 rounded-xl hover:bg-status-danger/20 text-status-danger transition-colors shrink-0"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Add Button */}
          <button
            onClick={() => {
              setSelectedTodo(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-violet to-brand-indigo hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Todo List Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-page-dim">
          <Loader2 className="w-8 h-8 animate-spin text-brand-violet" />
          <p className="text-sm font-medium">Đang tải danh sách công việc...</p>
        </div>
      ) : todos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-page-card-border/50 pt-6 mt-4 flex-col sm:flex-row gap-4">
              <span className="text-xs text-page-dim font-medium">
                Hiển thị trang {pagination.currentPage} / {pagination.totalPages} (Tổng {pagination.totalCount} công việc)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page === 1}
                  className="p-2.5 bg-page-card border border-page-card-border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-page-dim hover:text-page-text transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-page-dim disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold border transition-all ${
                      filters.page === p
                        ? 'bg-gradient-to-r from-brand-violet to-brand-indigo text-white border-transparent shadow-lg shadow-violet-500/10'
                        : 'bg-page-card border-page-card-border text-page-dim hover:text-page-text hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page === pagination.totalPages}
                  className="p-2.5 bg-page-card border border-page-card-border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-page-dim hover:text-page-text transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-page-dim disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-page-card/30 border border-page-card-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-page-card/60 border border-page-card-border flex items-center justify-center text-page-dim mb-2">
            <ListTodo className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-lg font-bold text-page-text">Không tìm thấy công việc</h3>
          <p className="text-page-muted text-xs sm:text-sm max-w-xs leading-relaxed">
            {searchTerm || filters.status 
              ? 'Không có kết quả nào khớp với bộ lọc tìm kiếm của bạn. Vui lòng thiết lập lại bộ lọc.'
              : 'Bạn chưa có công việc nào trong danh sách. Hãy nhấn nút "Thêm mới" để bắt đầu lên kế hoạch!'}
          </p>
          {(searchTerm || filters.status) && (
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-page-card border border-page-card-border hover:bg-black/5 dark:hover:bg-white/5 text-page-muted hover:text-page-text rounded-xl text-xs font-semibold transition-all"
            >
              Xem tất cả
            </button>
          )}
        </div>
      )}

      {/* Todo Modal Form Container */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTodo(null);
        }}
        onSubmit={handleModalSubmit}
        todo={selectedTodo}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
