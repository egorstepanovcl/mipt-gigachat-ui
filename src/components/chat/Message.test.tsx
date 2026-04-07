import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import Message from "./Message";

beforeAll(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

describe("Message — variant='user'", () => {
  it("содержит текст сообщения", () => {
    render(<Message variant="user" content="Привет мир" sender="Вы" />);
    expect(screen.getByText("Привет мир")).toBeInTheDocument();
  });

  it("имеет CSS-класс, соответствующий пользователю", () => {
    const { container } = render(
      <Message variant="user" content="Привет мир" sender="Вы" />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/wrapperUser/);
  });
});

describe("Message — variant='assistant'", () => {
  it("содержит текст сообщения", () => {
    render(
      <Message variant="assistant" content="Ответ ассистента" sender="GigaChat" />
    );
    expect(screen.getByText("Ответ ассистента")).toBeInTheDocument();
  });

  it("имеет CSS-класс, соответствующий ассистенту", () => {
    const { container } = render(
      <Message variant="assistant" content="Ответ ассистента" sender="GigaChat" />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/wrapperAssistant/);
  });
});

describe("Message — кнопка «Копировать»", () => {
  it("присутствует для variant='assistant'", () => {
    render(
      <Message variant="assistant" content="Ответ ассистента" sender="GigaChat" />
    );
    expect(screen.getByRole("button", { name: /копировать/i })).toBeInTheDocument();
  });

  it("отсутствует для variant='user'", () => {
    render(<Message variant="user" content="Сообщение пользователя" sender="Вы" />);
    expect(
      screen.queryByRole("button", { name: /копировать/i })
    ).not.toBeInTheDocument();
  });
});
