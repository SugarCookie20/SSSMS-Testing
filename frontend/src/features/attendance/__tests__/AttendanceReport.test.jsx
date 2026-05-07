import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AttendanceReport from "../AttendanceReport";
import api from "@/api/axiosInstance";

describe("AttendanceReport Component", () => {
  const mockReportData = {
    subjectName: "Structural Design",
    className: "TY-A",
    totalSessionsHeld: 25,
    range: "Oct 2023 - Nov 2023",
    studentStats: [
      { 
        studentName: "John Doe", 
        prn: "PRN001", 
        sessionsAttended: 20, 
        percentage: 80 
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
  });

  const renderReport = () => {
    return render(
      <MemoryRouter>
        <AttendanceReport />
      </MemoryRouter>
    );
  };

  it("renders report table with data", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockReportData });
    renderReport();
    
    expect(await screen.findByText(/Structural Design/i)).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`/ ${mockReportData.totalSessionsHeld}`)) ).toBeInTheDocument();
  });

  it("handles date range filtering", async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockReportData });
    renderReport();
    
    const fromDate = await screen.findByLabelText(/Start Date/i); 
    const toDate = screen.getByLabelText(/End Date/i);
    fireEvent.change(fromDate, { target: { value: "2023-09-01" } });
    fireEvent.change(toDate, { target: { value: "2023-09-30" } });
    
    const applyBtn = screen.getByRole("button", { name: /^Apply$/i });
    fireEvent.click(applyBtn);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining("startDate=2023-09-01"));
    });
  });

  it("triggers CSV download", async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockReportData });
    const mockUrl = "blob:mock-url";
    window.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    window.URL.revokeObjectURL = vi.fn();
    
    renderReport();
    
    const downloadBtn = await screen.findByRole("button", { name: /CSV/i });
    fireEvent.click(downloadBtn);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/download/"), expect.anything());
    });
  });
});
