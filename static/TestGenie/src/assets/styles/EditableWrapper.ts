import { styled } from "@mui/material/styles";

export const EditableWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  "&::after": {
    content: '"*This field is editable"',
    position: "absolute",
    bottom: "-24px",
    left: "0px",
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    opacity: 0.7,
    transition: "opacity 0.3s ease",
  },
}));
