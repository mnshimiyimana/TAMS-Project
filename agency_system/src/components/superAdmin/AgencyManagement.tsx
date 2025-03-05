import { useEffect } from "react";
import { useAgencies } from "@/hooks/superadmin/useAgencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Bus,
  User,
  Clock,
} from "lucide-react";

export default function AgencyManagement() {
  const {
    agencies,
    isLoading,
    searchQuery,
    setSearchQuery,
    deleteDialog,
    setDeleteDialog,
    createAdminDialog,
    setCreateAdminDialog,
    formData,
    handleInputChange,
    fetchAgencies,
    createAdmin,
    deleteAgency,
    toggleAgencyStatus,
  } = useAgencies();

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md px-2 w-64 bg-white">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search agencies..."
            className="border-none focus:ring-0 focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setCreateAdminDialog(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add Agency Admin
          </Button>
          <Button variant="outline" onClick={fetchAgencies}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Agency Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && agencies.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell colSpan={7} className="h-16 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : agencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No agencies found.
                  </TableCell>
                </TableRow>
              ) : (
                agencies.map((agency: any) => (
                  <TableRow key={agency._id}>
                    <TableCell className="font-medium">
                      {agency.agencyName}
                    </TableCell>
                    <TableCell>{agency.location}</TableCell>
                    <TableCell>
                      <Badge
                        variant={agency.isActive ? "default" : "secondary"}
                        className={
                          agency.isActive ? "bg-green-500" : "bg-gray-500"
                        }
                      >
                        {agency.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {agency.userStats?.total || 0} users
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center">
                          <Bus className="h-3 w-3 mr-1" />
                          {agency.resources?.buses || 0}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {agency.resources?.drivers || 0}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {agency.resources?.shifts || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              toggleAgencyStatus(
                                agency.agencyName,
                                agency.isActive
                              )
                            }
                          >
                            {agency.isActive ? (
                              <XCircle className="mr-2 h-4 w-4" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {agency.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                agencyId: agency._id,
                                agencyName: agency.agencyName,
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Agency Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the agency "
              {deleteDialog.agencyName}" and cannot be undone. All associated
              data including users, vehicles, and shifts will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAgency}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminDialog} onOpenChange={setCreateAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Agency Admin</DialogTitle>
            <DialogDescription>
              Create a new admin user for an agency
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createAdmin}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="agencyName" className="text-right text-sm">
                  Agency Name
                </label>
                <Input
                  id="agencyName"
                  name="agencyName"
                  placeholder="Enter agency name"
                  className="col-span-3"
                  required
                  value={formData.agencyName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right text-sm">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  className="col-span-3"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  className="col-span-3"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right text-sm">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  className="col-span-3"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="location" className="text-right text-sm">
                  Location
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter location"
                  className="col-span-3"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateAdminDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {isLoading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
