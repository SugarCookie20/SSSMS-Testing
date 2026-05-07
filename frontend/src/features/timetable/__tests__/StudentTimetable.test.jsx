import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentTimetable from "../StudentTimetable";
import api from "@/api/axiosInstance";

describe("StudentTimetable Component", () => {
  const mockTimetable = [
    { id: "t1", title: "Semester 5 Timetable", fileName: "sem5_tt.pdf", uploadDate: "2023-10-01" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTimetable = () => {
    return render(
      <MemoryRouter>
        <StudentTimetable />
      </MemoryRouter>
    );
  };

  it("renders timetable viewer when data exists", async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockTimetable });
    renderTimetable();
    
    // It should render FileViewer which has an iframe with title="Timetable"
    expect(await screen.findByTitle("Timetable")).toBeInTheDocument();
  });

  it("shows empty state if no timetables exist", async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    renderTimetable();
    
    expect(await screen.findByText(/No timetable uploaded for your class yet/i)).toBeInTheDocument();
  });
});
