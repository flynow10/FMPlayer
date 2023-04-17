import { UUID } from "@/components/UUID";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("<UUID/>", () => {
  test("uuid box is created with a valid uuid", async () => {
    render(<UUID />);

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gm
    );
  });
  test("a new uuid is created when the button is pressed", async () => {
    render(<UUID />);

    const oldUuid = screen.getByRole<HTMLInputElement>("textbox").value;
    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole<HTMLInputElement>("textbox").value).not.toBe(
      oldUuid
    );
  });
});
