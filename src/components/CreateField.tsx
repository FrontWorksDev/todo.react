import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { v1 } from "uuid";
import axios from "axios";
import styles from "../App.module.scss";

type Task = {
  ID: number;
  slug: string;
  title: string;
  status: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

type Props = {
  updateItem: Function;
};

function CreateField({ updateItem }: Props) {
  const [task, setTask] = useState("");
  const [endPoint, setEndPoint] = useState("");

  const createEndPoint = () => {
    let url = "";
    if (window.location.hostname.includes("localhost")) {
      url = "http://localhost:8080/";
    } else {
      url = "https://shielded-earth-14324.herokuapp.com/";
    }

    return url;
  };

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLButtonElement>,
    newTask: string
  ) => {
    e.preventDefault();
    const taskData: Task = {
      ID: 0,
      slug: v1(),
      title: newTask,
      status: 1,
    };
    updateItem(taskData);
    setTask("");

    axios
      .post(`${endPoint}task/v1/add`, taskData)
      .catch((err) => new Error(err));
  };

  useEffect(() => {
    const url = createEndPoint();
    setEndPoint(url);
  });

  return (
    <form action="?" className={styles.form}>
      <TextField
        label="Input Task"
        variant="standard"
        margin="none"
        className="form__field"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />

      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        onClick={(e) => handleSubmit(e, task)}
      >
        追加
      </Button>
    </form>
  );
}

export default CreateField;