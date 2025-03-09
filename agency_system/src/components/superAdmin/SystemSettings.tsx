import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { RefreshCw, FileText } from "lucide-react";
  
  export default function SystemSettings() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Email Configuration</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emailService">Email Service</Label>
                    <Input
                      id="emailService"
                      value="Gmail"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailUser">Email User</Label>
                    <Input
                      id="emailUser"
                      value="system@tams.com"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
  
              <div>
                <h3 className="font-medium mb-2">System Maintenance</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="mr-2 h-4 w-4" /> Rebuild System
                    Cache
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" /> Export System
                    Logs
                  </Button>
                </div>
              </div>
  
              <div>
                <h3 className="font-medium mb-2">API Configuration</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiUrl">API Base URL</Label>
                    <Input
                      id="apiUrl"
                      value="https://tams-project.onrender.com/api"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiTimeout">API Timeout (ms)</Label>
                    <Input
                      id="apiTimeout"
                      type="number"
                      value="30000"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }