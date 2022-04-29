import React, { useState, useEffect } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
} from "@mui/material";

type Props = {
  handleUpdate: Function;
  handleComplete: Function;
  ID: number;
  title: string;
  checked: boolean;
};

function CompletedList({
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
    <ListItem>
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

export default CompletedList;
