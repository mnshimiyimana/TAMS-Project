import { useEffect } from "react";
import { useDashboard } from "@/hooks/superadmin/useDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Building2, Users, Bus, Settings } from "lucide-react";

export default function SystemOverview() {
  const {
    summary,
    isLoading: dashboardLoading,
    fetchSystemSummary,
  } = useDashboard();

  useEffect(() => {
    fetchSystemSummary();
  }, [fetchSystemSummary]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Agencies
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading
                ? "..."
                : summary?.agencyStats?.totalAgencies || 0}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardLoading
                ? "..."
                : summary?.agencyStats?.activeAgencies || 0}{" "}
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "..." : summary?.userStats?.totalUsers || 0}
            </div>
            <p className="text-xs text-gray-500">
              {dashboardLoading
                ? "..."
                : summary?.recentActivity?.newUsersLast30Days || 0}{" "}
              new in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resources
            </CardTitle>
            <Bus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading
                ? "..."
                : (summary?.resourceStats?.totalBuses || 0) +
                  (summary?.resourceStats?.totalDrivers || 0)}
            </div>
            <p className="text-xs text-gray-500">Vehicles and Drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium text-green-600">Active</div>
            <p className="text-xs text-gray-500">All services running</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Agencies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Agencies</CardTitle>
            <CardDescription>
              Latest agencies added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : summary?.recentAgencies?.length > 0 ? (
              <div className="space-y-4">
                {summary.recentAgencies.map((agency: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{agency.agencyName}</p>
                      <p className="text-sm text-gray-500">{agency.location}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No agencies found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user logins and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : summary?.recentLogins?.length > 0 ? (
              <div className="space-y-4">
                {summary.recentLogins.map((login: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{login.username}</p>
                      <p className="text-sm text-gray-500">
                        {login.role}{" "}
                        {login.agencyName ? `at ${login.agencyName}` : ""}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(login.lastLogin).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">User Distribution</h3>
              {dashboardLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : summary?.userStats?.userDistribution ? (
                <div className="space-y-2">
                  {summary.userStats.userDistribution.map(
                    (role: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{role.role}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {role.count}
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${
                                  (role.count /
                                    summary?.userStats?.totalUsers) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Resource Statistics</h3>
              {dashboardLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Buses</span>
                    <span className="text-sm font-medium">
                      {summary?.resourceStats?.totalBuses || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Drivers</span>
                    <span className="text-sm font-medium">
                      {summary?.resourceStats?.totalDrivers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Shifts</span>
                    <span className="text-sm font-medium">
                      {summary?.resourceStats?.totalShifts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Feedback</span>
                    <span className="text-sm font-medium">
                      {summary?.resourceStats?.totalFeedback || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">System Timeline</h3>
              {dashboardLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>First Agency Created</span>
                    <span className="font-medium">
                      {summary?.timespan?.firstAgencyCreated
                        ? new Date(
                            summary.timespan.firstAgencyCreated
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latest Agency Created</span>
                    <span className="font-medium">
                      {summary?.timespan?.lastAgencyCreated
                        ? new Date(
                            summary.timespan.lastAgencyCreated
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
