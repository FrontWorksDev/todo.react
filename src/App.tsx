import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { v1 } from "uuid";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import styles from "./App.module.scss";

type Task = {
  ID: number;
  slug: string;
  title: string;
  status: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

type Tasks = {
  items: Task[];
};

const options: AxiosRequestConfig = {
  url: "http://localhost:8080/task/v1/list",
  method: "GET",
};

function App() {
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    axios(options).then((res: AxiosResponse<Tasks>) => {
      const data = res.data.items;
      setItems(data);
    });
  }, []);

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
    setItems([...items, taskData]);

    axios
      .post("http://localhost:8080/task/v1/add", taskData)
      .catch((err) => new Error(err));
  };

  const handleDelete = (id: number) => {
    setOpen(true);
    setValue(id);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = async () => {
    const deletedItems = items.filter((item) => item.ID !== value);
    setItems(deletedItems);
    await axios
      .delete(`http://localhost:8080/task/v1/delete/${value}`)
      .catch((err) => new Error(err));
    setOpen(false);
  };

  return (
    <Box className="App" sx={{ p: 1 }}>
      <form action="?" className={styles.form}>
        <TextField
          label="Input Task"
          variant="standard"
          margin="none"
          className="form__field"
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

      <List>
        {items.map(({ slug, title, ID }) => (
          <ListItem
            key={slug}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(ID)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={open}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
      >
        <DialogTitle>Do you want to delete the data?</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleCancel()} color="error">
            No
          </Button>
          <Button onClick={() => handleOk()}>Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
