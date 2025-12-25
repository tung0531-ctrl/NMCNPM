import { useEffect, useState } from "react";
import { logService } from "../services/logService";
import type { Log, GetLogsParams } from "../services/logService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

const LogViewerPage = () => {
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
      const data = await logService.getLogs({ ...filters, page });
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Lỗi khi tải log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.action, filters.entityType, filters.userId, filters.startDate, filters.endDate]);

  const handleFilterChange = (key: keyof GetLogsParams, value: unknown) => {
    setFilters({ ...filters, [key]: value });
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 });
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
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
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Xem log hoạt động</CardTitle>
          <p className="text-sm text-gray-500">Tổng số: {total} log</p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Bộ lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="action-filter">Hành động</Label>
                <Input
                  id="action-filter"
                  placeholder="Ví dụ: CREATE_USER, LOGIN..."
                  value={filters.action || ""}
                  onChange={(e) => handleFilterChange("action", e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="entity-filter">Loại đối tượng</Label>
                <Input
                  id="entity-filter"
                  placeholder="Ví dụ: USER, BILL..."
                  value={filters.entityType || ""}
                  onChange={(e) => handleFilterChange("entityType", e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="user-filter">User ID</Label>
                <Input
                  id="user-filter"
                  type="number"
                  placeholder="Nhập User ID"
                  value={filters.userId || ""}
                  onChange={(e) =>
                    handleFilterChange("userId", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
              <div>
                <Label htmlFor="start-date-filter">Từ ngày</Label>
                <Input
                  id="start-date-filter"
                  type="datetime-local"
                  value={filters.startDate || ""}
                  onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="end-date-filter">Đến ngày</Label>
                <Input
                  id="end-date-filter"
                  type="datetime-local"
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">ID</th>
                      <th className="border p-2 text-left">Thời gian</th>
                      <th className="border p-2 text-left">Người dùng</th>
                      <th className="border p-2 text-left">Hành động</th>
                      <th className="border p-2 text-left">Loại đối tượng</th>
                      <th className="border p-2 text-left">ID đối tượng</th>
                      <th className="border p-2 text-left">Chi tiết</th>
                      <th className="border p-2 text-left">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.logId} className="hover:bg-gray-50">
                        <td className="border p-2">{log.logId}</td>
                        <td className="border p-2 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="border p-2">
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
                        <td className="border p-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {log.action}
                          </span>
                        </td>
                        <td className="border p-2">{log.entityType || "-"}</td>
                        <td className="border p-2">{log.entityId || "-"}</td>
                        <td className="border p-2">
                          {log.details ? (
                            <pre className="text-xs max-w-xs overflow-auto">
                              {JSON.stringify(parseDetails(log.details), null, 2)}
                            </pre>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border p-2 text-xs">{log.ipAddress || "-"}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="border p-4 text-center text-gray-500">
                          Không có log nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogViewerPage;
