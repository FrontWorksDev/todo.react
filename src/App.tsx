import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  Toolbar,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  IconButton,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import { arrayMoveImmutable } from "array-move";
import { Close, DarkMode, LightMode } from "@mui/icons-material";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Draggable, Container, OnDropCallback } from "react-smooth-dnd";
import CreateField from "./components/CreateField";
import TaskList from "./components/TaskList";
import CompletedList from "./components/CompletedList";
import AuthButton from "./components/AuthButton";

type Task = {
  ID: number;
  slug: string;
  title: string;
  completed: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

type Tasks = {
  items: Task[];
};

function App() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [items, setItems] = useState<Task[]>([]);
  const [completedItems, setCompletedItems] = useState<Task[]>([]);
  const [task, setTask] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [value, setValue] = useState(0);
  const [endPoint, setEndPoint] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true })
  );
  const pastTheme = localStorage.getItem("theme");
  const titleRef = useRef<HTMLInputElement>(null);
  const createEndPoint = () => {
    let url = "";
    if (window.location.hostname.includes("localhost")) {
      url = "http://localhost:8080/";
    } else {
      url = "https://shielded-earth-14324.herokuapp.com/";
    }

    setEndPoint(url);
    return url;
  };
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
        },
      }),
    [isDarkMode]
  );

  const handleChangeTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
  };

  const handleSubmitUpdate = async (
    editedTitle: string,
    e?: React.KeyboardEvent
  ) => {
    if (e && e.code !== "Enter") {
      return;
    }
    const updateItem = items.map((item) =>
      item.ID === value ? Object.assign(item, { title: editedTitle }) : item
    );
    const updateCompletedItem = completedItems.map((completedItem) =>
      completedItem.ID === value
        ? Object.assign(completedItem, { title: editedTitle })
        : completedItem
    );
    setItems(updateItem);
    setCompletedItems(updateCompletedItem);
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
    setSnackbarOpen(true);
  };

  const handleUpdate = (id: number, title: string) => {
    setUpdate(true);
    setTask(title);
    setValue(id);
  };

  const handleComplete = async (id: number) => {
    setValue(id);

    const updateItem = items.map((item) =>
      item.ID === id ? Object.assign(item, { completed: true }) : item
    );
    const removeCompletedItem = updateItem.filter(
      (item) => item.completed !== true
    );
    const completedItem = updateItem.filter((item) => item.ID === id);
    setItems(removeCompletedItem);
    setCompletedItems([...completedItems, ...completedItem]);
    await axios.put(`${endPoint}task/v1/update/${id}`, {
      completed: true,
      title: completedItem[0].title,
    });
  };

  const handleUndoComplete = async (id: number) => {
    setValue(id);

    const updateItem = completedItems.map((item) =>
      item.ID === id ? Object.assign(item, { completed: false }) : item
    );
    const removeCompletedItem = updateItem.filter(
      (item) => item.completed !== false
    );
    const completedItem = updateItem.filter((item) => item.ID === id);
    setItems([...items, ...completedItem]);
    setCompletedItems(removeCompletedItem);
    await axios.put(`${endPoint}task/v1/update/${id}`, {
      completed: false,
      title: completedItem[0].title,
    });
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const updateItem = (newItem: Task): void => {
    setItems([...items, newItem]);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <Close fontSize="small" />
    </IconButton>
  );

  const onDrop: OnDropCallback = ({ removedIndex, addedIndex }) => {
    setItems(arrayMoveImmutable(items, removedIndex!, addedIndex!));
  };

  useEffect(() => {
    if (pastTheme === "dark") {
      setIsDarkMode(true);
    } else if (pastTheme === "light") {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const url = createEndPoint();
    setEndPoint(url);
    const options: AxiosRequestConfig = {
      url: `${url}task/v1/list/${user?.sub}`,
      method: "POST",
    };
    const completedOptions: AxiosRequestConfig = {
      url: `${url}task/v1/completedList/${user?.sub}`,
      method: "POST",
    };

    axios(options).then((res: AxiosResponse<Tasks>) => {
      const data = res.data.items;
      setItems(data);
    });
    axios(completedOptions).then((res: AxiosResponse<Tasks>) => {
      const data = res.data.items;
      setCompletedItems(data);
    });
  }, [user?.sub]);

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress thickness={4} size={80} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App">
        {!isAuthenticated ? (
          <Dialog open>
            <DialogTitle>Log in to your account</DialogTitle>
            <DialogContent>
              <DialogContentText>ログインをしてください。</DialogContentText>
            </DialogContent>
            <DialogActions>
              <AuthButton />
            </DialogActions>
          </Dialog>
        ) : (
          <AppBar position="static" color="transparent">
            <Toolbar>
              <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
                Todo.app
              </Typography>
              <IconButton value="light" onClick={() => handleChangeTheme()}>
                {isDarkMode ? <DarkMode /> : <LightMode />}
              </IconButton>
              <AuthButton />
            </Toolbar>
          </AppBar>
        )}
        {isAuthenticated && (
          <Box sx={{ p: 1 }}>
            <CreateField updateItem={updateItem} userId={user?.sub!} />
            <List>
              <Container
                dragHandleSelector=".drag-handle"
                lockAxis="y"
                onDrop={onDrop}
              >
                {items.map(({ slug, title, ID, completed }) => (
                  <Draggable key={ID}>
                    <TaskList
                      key={slug}
                      handleDelete={handleDelete}
                      handleUpdate={handleUpdate}
                      handleComplete={handleComplete}
                      ID={ID}
                      title={title}
                      checked={completed}
                    />
                  </Draggable>
                ))}
              </Container>
            </List>
            <List>
              {completedItems.map(({ slug, title, ID, completed }) => (
                <CompletedList
                  key={slug}
                  handleUpdate={handleUpdate}
                  handleUndoComplete={handleUndoComplete}
                  ID={ID}
                  title={title}
                  checked={completed}
                />
              ))}
            </List>
          </Box>
        )}

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
              onKeyPress={(e) => handleSubmitUpdate(titleRef.current!.value, e)}
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          message="Deleted Task"
          action={action}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
