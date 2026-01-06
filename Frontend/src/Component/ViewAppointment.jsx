import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, XCircle } from "lucide-react";

export default function ViewAppointments() {
  const appointments = [
    {
      id: 1,
      service: "Laptop Repair",
      date: "2025-01-10",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      service: "Mobile Screen Replacement",
      date: "2025-01-12",
      time: "02:30 PM",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-6">My Appointments</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {appointments.map((app) => (
          <Card key={app.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium mb-2">{app.service}</h2>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar size={16} />
                <span>{app.date}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Clock size={16} />
                <span>{app.time}</span>
              </div>

              <span
                className={`inline-block mb-4 px-3 py-1 text-xs rounded-full ${
                  app.status === "Confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {app.status}
              </span>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <XCircle size={16} /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
