import { useEffect, useState } from "react";
import { logService } from "../services/logService";
import type { Log, GetLogsParams } from "../services/logService";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";import { useNavigate } from "react-router";
import { formatUTCToLocal } from '@/lib/formatDate';
const LogViewerPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetLogsParams>({
    page: 1,
    limit: 50,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching logs with filters:', { ...filters, page });
      const data = await logService.getLogs({ ...filters, page });
      console.log('Logs received:', data);
      console.log('First log ALL fields:', data.logs[0]);
      console.log('First log createdAt:', data.logs[0]?.createdAt, typeof data.logs[0]?.createdAt);
      console.log('First log createdAt:', data.logs[0]?.createdAt, typeof data.logs[0]?.createdAt);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      console.error('Error fetching logs:', error);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
      toast.error(err.response?.data?.message || "Lỗi khi tải log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (key: keyof GetLogsParams, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 });
    setPage(1);
    fetchLogs();
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const out = formatUTCToLocal(dateString, 'vi-VN', { second: '2-digit' });
    return out || '-';
  };

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return "-";
    
    // 1. Kiểm tra các trình duyệt có nhân tùy biến TRƯỚC (Thứ tự ưu tiên cao)
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("coc_coc_browser")) return "Cốc Cốc"; // Rất phổ biến tại VN
    if (userAgent.includes("Brave")) return "Brave";

    // 2. Kiểm tra Chrome (Sau khi đã loại trừ Edge, Opera, Cốc Cốc)
    if (userAgent.includes("Chrome")) return "Chrome";

    // 3. Kiểm tra Firefox (Đứng đâu cũng được vì nó khá biệt lập)
    if (userAgent.includes("Firefox")) return "Firefox";

    // 4. Kiểm tra Safari (Phải để sau Chrome vì Chrome UA cũng chứa chữ Safari)
    if (userAgent.includes("Safari")) return "Safari";
    
    return "Khác";
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-purple" />
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Xem log hoạt động</h1>
                    <p className="text-base text-muted-foreground">
                      Tổng số: {total} log
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="h-10 text-base px-4"
                  >
                    ← Về trang chủ
                  </Button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-base">Bộ lọc</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="action-filter" className="text-base">Hành động</Label>
                      <Input
                        id="action-filter"
                        placeholder="Ví dụ: CREATE_USER, LOGIN..."
                        value={filters.action || ""}
                        onChange={(e) => handleFilterChange("action", e.target.value || undefined)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="h-10 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entity-filter" className="text-base">Loại đối tượng</Label>
                      <Input
                        id="entity-filter"
                        placeholder="Ví dụ: USER, BILL..."
                        value={filters.entityType || ""}
                        onChange={(e) => handleFilterChange("entityType", e.target.value || undefined)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="h-10 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="user-filter" className="text-base">User ID</Label>
                      <Input
                        id="user-filter"
                        type="number"
                        placeholder="Nhập User ID"
                        value={filters.userId || ""}
                        onChange={(e) =>
                          handleFilterChange("userId", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="h-10 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="start-date-filter" className="text-base">Từ ngày</Label>
                      <Input
                        id="start-date-filter"
                        type="datetime-local"
                        value={filters.startDate || ""}
                        onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                        className="h-10 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date-filter" className="text-base">Đến ngày</Label>
                      <Input
                        id="end-date-filter"
                        type="datetime-local"
                        value={filters.endDate || ""}
                        onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                        className="h-10 text-base"
                      />
                    </div>
                  </div>
                  
                  {/* Search and Clear Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSearch} disabled={loading} className="h-10 text-base px-4">
                      {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      disabled={loading}
                      className="h-10 text-base px-4"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>

                {/* Logs Table */}
                {loading ? (
                  <div className="text-center py-8">Đang tải...</div>
                ) : (
                  <>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Thời gian</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Người dùng</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Hành động</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Loại đối tượng</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">ID đối tượng</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Chi tiết</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Trình duyệt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {logs.map((log) => (
                              <tr key={log.logId} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm">{log.logId}</td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {formatDate(log.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {log.user ? (
                                  <div>
                                    <div className="font-medium">{log.user.username}</div>
                                    <div className="text-xs text-gray-500">{log.user.fullName}</div>
                                    <div className="text-xs text-gray-400">
                                      {log.user.role}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Hệ thống</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">{log.entityType || "-"}</td>
                              <td className="px-4 py-3 text-sm">{log.entityId || "-"}</td>
                              <td className="px-4 py-3 text-sm">
                                {log.details ? (
                                  <pre className="text-xs max-w-xs overflow-auto">
                                    {JSON.stringify(parseDetails(log.details), null, 2)}
                                  </pre>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="font-mono text-xs">{log.ipAddress || "-"}</span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="text-xs">{getBrowserName(log.userAgent)}</span>
                              </td>
                            </tr>
                          ))}
                          {logs.length === 0 && (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                Không có log nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="text-base text-muted-foreground">
                        Hiển thị {logs.length} trong tổng số {total} log
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          disabled={page === 1 || loading}
                          title="Trang đầu"
                        >
                          ««
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1 || loading}
                        >
                          ‹ Trước
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {(() => {
                            const current = page;
                            const total = totalPages;
                            const pages = [];
                            
                            if (total <= 7) {
                              for (let i = 1; i <= total; i++) {
                                pages.push(i);
                              }
                            } else {
                              pages.push(1);
                              
                              if (current > 3) {
                                pages.push('...');
                              }
                              
                              const start = Math.max(2, current - 1);
                              const end = Math.min(total - 1, current + 1);
                              
                              for (let i = start; i <= end; i++) {
                                if (!pages.includes(i)) {
                                  pages.push(i);
                                }
                              }
                              
                              if (current < total - 2) {
                                pages.push('...');
                              }
                              
                              if (!pages.includes(total)) {
                                pages.push(total);
                              }
                            }
                            
                            return pages.map((pageNum, idx) => 
                              typeof pageNum === 'number' ? (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === current ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setPage(pageNum)}
                                  disabled={loading}
                                  className="min-w-[40px]"
                                >
                                  {pageNum}
                                </Button>
                              ) : (
                                <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                  {pageNum}
                                </span>
                              )
                            );
                          })()}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages || loading}
                        >
                          Sau ›
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages || loading}
                          title="Trang cuối"
                        >
                          »»
                        </Button>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-base text-muted-foreground">Đến trang:</span>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            placeholder={page.toString()}
                            className="w-20 px-3 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseInt((e.target as HTMLInputElement).value);
                                if (value >= 1 && value <= totalPages) {
                                  setPage(value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LogViewerPage;
