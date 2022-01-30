import React from "react";
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  handleDelete: Function;
  handleUpdate: Function;
  ID: number;
  title: string;
};

function TaskList({ handleDelete, handleUpdate, ID, title }: Props) {
  return (
    <ListItem
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
  );
}

export default TaskList;
