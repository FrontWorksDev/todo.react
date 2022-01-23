import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
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

function App() {
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [value, setValue] = useState(0);
  const [endPoint, setEndPoint] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const createEndPoint = () => {
    let url = "";
    if (window.location.hostname.includes("localhost")) {
      url = "http://localhost:8080/";
    } else {
      url = "https://shielded-earth-14324.herokuapp.com/";
    }

    return url;
  };

  useEffect(() => {
    const url = createEndPoint();
    setEndPoint(url);
    const options: AxiosRequestConfig = {
      url: `${url}task/v1/list`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

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
      .post(`${endPoint}task/v1/add`, taskData)
      .catch((err) => new Error(err));
  };

  const handleSubmitUpdate = async (editedTitle: string) => {
    const updateItem = items.map((item) =>
      item.ID === value ? Object.assign(item, { title: editedTitle }) : item
    );
    setItems(updateItem);
    await axios.put(`${endPoint}task/v1/update/${value}`, {
      title: editedTitle,
    });
    setUpdate(false);
  };

  const handleDelete = (id: number) => {
    setOpen(true);
    setValue(id);
  };

  const handleCancel = () => {
    setOpen(false);
    setUpdate(false);
  };

  const handleOk = async () => {
    const deletedItems = items.filter((item) => item.ID !== value);
    setItems(deletedItems);
    await axios
      .delete(`${endPoint}task/v1/delete/${value}`)
      .catch((err) => new Error(err));
    setOpen(false);
  };

  const handleUpdate = (id: number, title: string) => {
    setUpdate(true);
    setTask(title);
    setValue(id);
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
            <ListItemButton onClick={() => handleUpdate(ID, title)}>
              <ListItemText primary={title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Dialog
        open={update}
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        onClose={handleCancel}
      >
        <DialogTitle>Update</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            fullWidth
            variant="standard"
            defaultValue={task}
            inputRef={titleRef}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCancel()} color="error">
            Cancel
          </Button>
          <Button onClick={() => handleSubmitUpdate(titleRef.current!.value)}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
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
