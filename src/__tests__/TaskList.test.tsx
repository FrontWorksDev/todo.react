import React from "react";
import { render } from "@testing-library/react";
import user from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import TaskList from "../components/TaskList";

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

describe("task lists", () => {
  test("get task", () => {
    const handleUpdate = (id: number, title: string) => {
      setUpdate(true);
      setTask(title);
      setValue(id);
    };

    const handleDelete = (id: number) => {
      setOpen(true);
      setValue(id);
    };

    const { getByText } = render(
      <TaskList
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        ID={1}
        title="hogehoge"
      />
    );
    const list = getByText("hogehoge");
    expect(list).toBeInTheDocument();
  });

  test("open udpate modal", () => {
    let update = false;
    let task = "";
    let value = 0;
    let open = false;
    const handleUpdate = (id: number, title: string) => {
      update = true;
      task = title;
      value = id;
    };

    const handleDelete = (id: number) => {
      open = true;
      value = id;
    };

    const { getByText } = render(
      <TaskList
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        ID={1}
        title="hogehoge"
      />
    );
    expect(update).toBeFalsy();
    expect(task).toEqual("");
    expect(value).toEqual(0);

    const list = getByText(/hogehoge/i);
    user.click(list);
    expect(update).toBeTruthy();
    expect(task).toEqual("hogehoge");
    expect(value).toEqual(1);
  });

  test("open delete modal", () => {
    let update = false;
    let task = "";
    let value = 0;
    let open = false;
    const handleUpdate = (id: number, title: string) => {
      update = true;
      task = title;
      value = id;
    };

    const handleDelete = (id: number) => {
      open = true;
      value = id;
    };

    const { getByLabelText } = render(
      <TaskList
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        ID={1}
        title="hogehoge"
      />
    );
    expect(value).toEqual(0);
    expect(open).toBeFalsy();

    const deletedItem = getByLabelText(/delete/i);
    user.click(deletedItem);
    expect(value).toEqual(1);
    expect(open).toBeTruthy();
  });
});
