import React, { useState, useRef } from "react";
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import { Box, Grid, Button } from '@mui/material';
import styled from '@emotion/styled';
import uploadpicImage from './test-pic/uploadpic.png'; // Import the image for the upload button

// Styled component for a hidden input element
const CustomInput = styled('input')({
    display: 'none', // Hide the input element
});

const Uploadpic = ({ name, onSubmit, initialImage }) => {
    const [formState, setFormState] = useState({
        labImage: null, // State to hold the selected image file
        description: "",   // Placeholder for additional form data
    });
    const [initialImageURL, setInitialImageURL] = useState(initialImage); // State to hold the initial image URL

    const fileInputRef = useRef(null); // Reference to the hidden file input element

    // Function to trigger the file input element click event
    const handleFileUpload = () => {
        fileInputRef.current.click(); // Clicks the hidden file input element
    };

    // Function to handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Get the selected file
        setFormState({ ...formState, labImage: file }); // Update the state with the selected file
        setInitialImageURL(null); // Clear the initial image URL
        console.log('Selected file:', file); // Log the selected file to the console (for demonstration)
        // Add logic to handle file upload here if needed (e.g., upload to server)
    };

    return (
        <Grid item xs={12} container justifyContent="center">
            {formState.labImage || initialImageURL ? ( // If an image has been selected or initial image exists
                <Box sx={{ position: "relative" }}>
                    {/* Display the uploaded image */}
                    <img
                        src={formState.labImage ? URL.createObjectURL(formState.labImage) : initialImageURL} // Use initial image URL if no new image is selected
                        alt="Uploaded Picture"
                        style={{ width: "100%", height: "auto" }}
                    />
                    {/* Hidden input wrapped in a Button component to trigger file selection */}
                    <Button
                        variant="contained"
                        component="label" // Use label component to style the Button
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0, // Make the Button invisible
                            backgroundColor: "transparent", // Transparent background
                            color: "black", // Text color
                        }}
                    >
                        {/* Custom styled input for file selection */}
                        <CustomInput
                            type="file" // File input type
                            onChange={handleFileChange} // Handle file selection change
                        />
                    </Button>
                </Box>
            ) : ( // If no image has been selected and no initial image exists
                <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        {/* Hidden file input element */}
                        <input
                            type="file" // File input type
                            ref={fileInputRef} // Reference to access the file input element
                            onChange={handleFileChange} // Handle file selection change
                            style={{ display: 'none' }} // Hide the file input element
                        />
                        {/* Button with background image for file upload */}
                        <button
                            onClick={handleFileUpload} // Trigger file input element click event
                            style={{
                                backgroundImage: `url(${uploadpicImage})`, // Background image for the button
                                backgroundSize: 'cover', // Cover background size
                                backgroundPosition: 'center', // Centered background position
                                backgroundRepeat: 'no-repeat', // No repeat for background
                                border: 'none', // No border
                                width: '180px', // Button width
                                height: '200px', // Button height
                                cursor: 'pointer', // Pointer cursor on hover
                                outline: 'none', // No outline on focus
                            }}
                        >
                            {/* You can add text or other elements inside the button if needed */}
                        </button>
                    </div>
                    {/* Additional form elements or content */}
                    {/* <Box mt={5}>
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            
                            <textarea rows="4" cols="50" placeholder="Write your comment here..."></textarea>
                        </div>
                    </Box> */}
                </Box>
            )}
        </Grid>
    );
}

// PropTypes validation for props
Uploadpic.propTypes = {
    name: PropTypes.string.isRequired, // 'name' prop should be a required string
    onSubmit: PropTypes.func.isRequired, // 'onSubmit' prop should be a required function
    initialImage: PropTypes.string, // 'initialImage' prop for the initial image URL
};

export default Uploadpic;
