import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { Delete } from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Utils/Firebase/Firebase";

const MemberList = ({ members, setMembers }) => {
  const [researchers, setResearchers] = useState([]);

  useEffect(() => {
    const fetchResearchers = async () => {
      const querySnapshot = await getDocs(collection(db, "researchers"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // sort data on name field
      data.sort((a, b) => a.name.localeCompare(b.name));

      setResearchers(data.filter((res) =>!res.isFormer));
    };

    fetchResearchers();
  }, []);

  const handleAuthorChange = (index, newId) => {
    const updatedMembers = members.map((member, i) =>
      i === index ? researchers.find((res) => res.id === newId) : member
    );
    setMembers(updatedMembers);
  };

  const handleRemoveAuthor = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleAddAuthor = () => {
    if (researchers.length > 0) {
      setMembers([...members, researchers[0]]);
    }
  };

  return (
    <Box className="my-5">
      <Typography variant="h6">Member List</Typography>
      {members.map((author, index) => (
        <Box key={index} display="flex" alignItems="center" gap={2} className="mb-3">
          <Avatar src={author.profilePhoto} alt={author.name} />
          <FormControl fullWidth>
            <InputLabel>Select Member</InputLabel>
            <Select value={author.id} onChange={(e) => handleAuthorChange(index, e.target.value)}>
              {researchers.map((res) => (
                <MenuItem key={res.id} value={res.id}>
                  {res.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton color="error" onClick={() => handleRemoveAuthor(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button variant="outlined" onClick={handleAddAuthor}>
        Add Members
      </Button>
    </Box>
  );
};

export default MemberList;
