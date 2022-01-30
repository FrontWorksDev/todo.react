import React from "react";
import { render } from "@testing-library/react";
import user from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import CreateField from "../components/CreateField";

const mock = new MockAdapter(axios);
type Task = {
  ID: number;
  slug: string;
  title: string;
  status: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

let items: Task[] = [];
mock
  .onPost("/add")
  .reply(200, {
    message: "ok",
  })
  .onAny()
  .reply(500);

describe("post new task item", () => {
  beforeEach(() => {
    items = [];
  });
  test("post new Task items", async () => {
    const updateItem = (newItem: Task): void => {
      items.push(newItem);
    };
    const { getByLabelText, getByText } = render(
      <CreateField updateItem={updateItem} />
    );

    const input = getByLabelText(/input task/i);
    const submitButton = getByText(/追加/i);
    user.type(input, "hogehoge");
    expect(input).toHaveValue("hogehoge");

    user.click(submitButton);
    const result = await axios
      .post("/add", items)
      .catch((err) => new Error(err));
    const error = await axios
      .post("/create", items)
      .catch((err) => new Error(err));

    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(result.data.message).toEqual("ok");
    expect(error.message).toEqual("Error: Request failed with status code 500");
  });

  test("clear input text", () => {
    const updateItem = (newItem: Task): void => {
      items.push(newItem);
    };
    const { getByLabelText, getByText } = render(
      <CreateField updateItem={updateItem} />
    );
    const inputText = getByLabelText(/input task/i);
    user.type(inputText, "test task");
    const submitButton = getByText(/追加/i);
    expect(inputText).toHaveValue("test task");
    user.click(submitButton);
    expect(inputText).toHaveValue("");
  });
});
