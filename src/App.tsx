import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { v1 } from "uuid";
import styles from "./App.module.scss";

type Task = {
  id: string;
  title: string;
};

function App() {
  const [items, setItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");

  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLButtonElement>,
    newTask: string
  ) => {
    e.preventDefault();
    const taskData: Task = {
      id: v1(),
      title: newTask,
    };
    setItems([...items, taskData]);
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
        {items.map(({ id, title }) => (
          <ListItem
            key={id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default App;
