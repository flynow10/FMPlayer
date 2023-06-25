import { UUID } from "@/src/components/utils/UUID";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("<UUID/>", () => {
  test("uuid box is created with a valid uuid", async () => {
    render(<UUID />);

    expect(document.getElementById("uuid")?.textContent).toMatch(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gm
    );
  });
  test("a new uuid is created when the button is pressed", async () => {
    render(<UUID />);

    const oldUuid = document.getElementById("uuid")?.textContent;
    await userEvent.click(screen.getByRole("button"));

    expect(document.getElementById("uuid")?.textContent).not.toBe(oldUuid);
  });
});
