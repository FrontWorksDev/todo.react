import React, { useState, useEffect } from "react";
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  handleDelete: Function;
  handleUpdate: Function;
  handleComplete: Function;
  ID: number;
  title: string;
  checked: boolean;
};

function TaskList({
  handleDelete,
  handleUpdate,
  handleComplete,
  ID,
  title,
  checked,
}: Props) {
  const [listColor, setListColor] = useState({});

  useEffect(() => {
    if (checked) {
      setListColor({ color: "#bababa" });
    }
  }, [checked]);

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
      className="drag-handle"
    >
      <Checkbox
        aria-label="Complete"
        onClick={() => handleComplete(ID)}
        checked={checked}
      />
      <ListItemButton onClick={() => handleUpdate(ID, title)}>
        <ListItemText primary={title} primaryTypographyProps={listColor} />
      </ListItemButton>
    </ListItem>
  );
}

export default TaskList;
