import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "./ChatInput";

describe("ChatInput", () => {
  it("при непустом значении и клике на кнопку «Отправить» вызывается onSend с текстом сообщения", () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatInput value="Hello world" onChange={onChange} onSend={onSend} />
    );

    fireEvent.click(screen.getByTitle("Отправить"));

    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith("Hello world");
  });

  it("при нажатии Enter с непустым вводом вызывается onSend", () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatInput value="Test message" onChange={onChange} onSend={onSend} />
    );

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      code: "Enter",
    });

    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("кнопка «Отправить» заблокирована (disabled) при пустом поле ввода", () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(<ChatInput value="" onChange={onChange} onSend={onSend} />);

    expect(screen.getByTitle("Отправить")).toBeDisabled();
  });

  it("кнопка «Отправить» заблокирована (disabled) при значении из пробелов", () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(<ChatInput value="   " onChange={onChange} onSend={onSend} />);

    expect(screen.getByTitle("Отправить")).toBeDisabled();
  });

  it("Shift+Enter не вызывает onSend (перенос строки)", () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(
      <ChatInput value="Test message" onChange={onChange} onSend={onSend} />
    );

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
    });

    expect(onSend).not.toHaveBeenCalled();
  });
});
