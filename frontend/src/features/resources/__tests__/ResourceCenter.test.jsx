import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResourceCenter from "../ResourceCenter";
import api from "@/api/axiosInstance";

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
    useParams: () => ({ id: "123" }),
  };
});

describe("ResourceCenter Component", () => {
  const mockResources = [
    { id: "r1", title: "Lecture 1", fileName: "lec1.pdf", date: "2023-10-01" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValue({ status: 200 });
    vi.spyOn(api, 'delete').mockResolvedValue({ status: 200 });
  });

  const renderResourceCenter = () => {
    return render(
      <MemoryRouter initialEntries={["/faculty/resources/123"]}>
        <Routes>
          <Route path="/faculty/resources/:id" element={<ResourceCenter />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders resources list after fetch", async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockResources });
    renderResourceCenter();
    
    expect(await screen.findByText("Lecture 1")).toBeInTheDocument();
  });

  it("handles file upload successfully", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    vi.spyOn(api, 'post').mockResolvedValueOnce({ status: 200 });
    
    renderResourceCenter();
    
    const titleInput = screen.getByPlaceholderText(/e.g. Unit 1 Lecture Notes/i);
    const fileInput = document.getElementById("file-upload");
    
    await user.type(titleInput, "New Resource");
    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    
    const submitBtn = screen.getByRole("button", { name: /Upload File/i });
    fireEvent.submit(submitBtn.closest('form'));
    
    expect(await screen.findByText(/File Uploaded Successfully!/i)).toBeInTheDocument();
  });

  it("shows error if title is too long", async () => {
    const user = userEvent.setup();
    renderResourceCenter();
    
    const titleInput = screen.getByPlaceholderText(/e.g. Unit 1 Lecture Notes/i);
    // Directly set value to avoid slow typing of 151 chars
    fireEvent.change(titleInput, { target: { value: "a".repeat(151) } });
    
    const fileInput = document.getElementById("file-upload");
    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    
    const submitBtn = screen.getByRole("button", { name: /Upload File/i });
    fireEvent.submit(submitBtn.closest('form'));
    
    expect(await screen.findByText(/Title must be under 150 characters./i)).toBeInTheDocument();
  });

  it("handles resource deletion", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: mockResources });
    vi.spyOn(api, 'delete').mockResolvedValueOnce({ status: 200 });
    
    renderResourceCenter();
    
    const deleteBtn = await screen.findByTitle("Delete");
    await user.click(deleteBtn);
    
    const dialog = await screen.findByRole("alertdialog");
    const confirmBtn = within(dialog).getByRole("button", { name: /Delete/i });
    await user.click(confirmBtn);
    
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/resources/r1");
    });
    expect(await screen.findByText(/Resource deleted successfully./i)).toBeInTheDocument();
  });
});
