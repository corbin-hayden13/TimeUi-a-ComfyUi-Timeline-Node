# TimeUi a ComfyUI Timeline Node System

## Warning

The project is still in its early stages and there is no usable node at the moment. The only code available was made in HTML, JS, and CSS for the purpose of the presentation video of the project idea. I am still looking for developers to contribute to the project. I just pushed a very early code for the final node.

## 07 JUNE 2024 : BuildLog #2

### Updates
Today's focus was on refining the timeline node system, enhancing the interface, and implementing new functionalities.

### Changes Made and Steps Completed
1. **Reorder Functionality:**
   - Integrated the `Sortable.min.js` library for enhanced drag-and-drop capabilities to reorder image rows.
   - Removed the dependency on `draggablelist.js`.

2. **Interface Improvements:**
   - Updated the CSS for a more polished look and better usability.
   - Added SVG icons for adding/removing rows, timeframes, and image uploads for a more intuitive interface.

3. **Enhanced Node Features:**
   - Improved the node structure by implementing customizable widgets using `ComfyWidgets`.
   - Created a more modular and scalable approach to handling image rows and timelines.

4. **Resizable and Draggable Handlers:**
   - Implemented custom handlers for resizing and dragging timeline elements.
   - Added event listeners for better interaction handling.

5. **Image Upload Handling:**
   - Improved the image upload process to ensure uploaded images display correctly within their containers.

### Needs and Future Development
1. **Further Refine Reorder Functionality:**
   - Continue testing and refining the reordering functionality to ensure it handles all edge cases smoothly.

2. **Dynamic Node Height Adjustment:**
   - Implement a solution for dynamically adjusting the node's height based on the content to prevent overflow issues.

3. **Code Multiple Timeline Handlers:**
   - Develop a way to add multiple timeline handlers within the same timeline, allowing for more complex animations and interactions.

4. **General Development Assistance:**
   - Seeking developers with experience in ComfyUI node development to collaborate on this project.
   - Particularly need help with JavaScript and Python integration for a fully functional node system.

5. **Feedback and Contributions:**
   - Looking for feedback on the current implementation and suggestions for improvement.
   - Open to contributions from the community to enhance the functionality and usability of the timeline node system.


## 06 JUNE 2024 : BuildLog #1

### Steps Completed

1. **Implemented the Widget on Top of the Node**:
   - Developed the initial interface for the timeline node system.
   - Implemented basic functionality to add, remove, and rearrange image rows in the timeline. I used the "draggablelist.js" library already in the ComfyUI core.
   - Added HTML, CSS, and JS code to create the presentation video demonstrating the project idea.

2. **Began Development of the Timeline**:
   - Started the implementation of the timeline feature.
   - Currently, the timeline does not function as intended; users can interact with the interface but image uploads do not update their positions within the list of image rows. To preview the image after upload, I used the "imagePreview.js" library already in the ComfyUI core.

### Needs and Future Development

1. **Image Position Update**:
   - Need to implement functionality to update the position of images within the list of image rows when they are rearranged. I used the "draggablelist.js" library already in the ComfyUI core.

2. **Dynamic Node Height**:
   - Develop the node to dynamically adjust its height based on the content. Currently, adding too many rows causes them to overflow outside the node. Need to find a solution that adapts the height of the node to its content.

3. **General Development Assistance**:
   - Seeking developers with experience in ComfyUI node development to collaborate on this project.
   - Particularly need help with JavaScript and Python integration for a fully functional node system.

4. **Feedback and Contributions**:
   - Looking for feedback on the current implementation and suggestions for improvement.
   - Open to contributions from the community to enhance the functionality and usability of the timeline node system.


## Introduction

Hi everyone,

I've been working on the UX/UI of a timeline custom node system for ComfyUI over the past two weeks. The goal is to create a timeline similar to video/animation editing tools, without relying on traditional timeframe code. You can effortlessly add, delete, or rearrange rows, providing a streamlined user experience.

https://github.com/jimmm-ai/TimeUi-a-ComfyUi-Timeline-Node/assets/171628007/0ba5eb01-764f-46d2-830b-d2468b05c053

## Image Upload and Management
Users can upload images directly into the nodes or attach other "upload image" nodes, simplifying the workflow. You can also add a second instance of the timeline within the same row, allowing you to loop images for easier management of complex animations. For example, seamlessly loop a repeating background or sequence within your animation.

https://github.com/jimmm-ai/TimeUi-a-ComfyUi-Timeline-Node/assets/171628007/dc5eaff0-54d2-4acd-8eca-3774c03271d8

## Customization and Settings

Each row in the timeline includes various settings for customization. Toggle the visibility of image masks with a click, enhancing control over image adjustments. Nodes can work independently or with other external nodes. Easily toggle settings like IP adapter, Image Negative, Attn Mask, Clip vision, Mask, and more to fine-tune outputs.

https://github.com/jimmm-ai/TimeUi-a-ComfyUi-Timeline-Node/assets/171628007/b1109d20-3355-4d51-ba53-cd19e3d3b6f9

## Time Format and Duration

You can change the time format of the timeline and the animation duration, in frames or seconds. The nodes will update the time formats in the timeline ruler, displaying the number of frames or seconds that each image takes on the timeline handler.

https://github.com/jimmm-ai/TimeUi-a-ComfyUi-Timeline-Node/assets/171628007/b187d4a8-2f46-4b36-8548-92eb86b885ee

## Bezier Curve Feature

At the bottom of the nodes, there is a button to view the Bezier curve result of the current timeline, similar to the "KfCurveDraw" nodes. This feature is still under design.

https://github.com/jimmm-ai/TimeUi-a-ComfyUi-Timeline-Node/assets/171628007/957da250-f2dd-455b-8f4e-4f966ee4d155

## Call for Collaboration

This project is a work in progress, and I welcome any suggestions or contributions from the community. Let's collaborate to make this a powerful tool for everyone!

I have created a GitHub repository for this. Since I am not a professional developer, I developed this in HTML, JS, and CSS with the help of ChatGPT for the purpose of the video presentation. I really want to find the right community ready to create this with me.

I know these are not the right languages to code a node, which is why I need the community to build this with me as an open-source node.

I am not very familiar with common GitHub practices, so if someone has experience in ComfyUI node development and can become my sidekick on this project, please send me a message.

## Vision and Inspiration

I believe these nodes can bridge complex node setups and a full web UI, making it easier for less experienced users to get started before moving on to more advanced solutions. This idea came from using workflows by various developers over the last two months.

Feel free to contact me! Don't hesitate to reach out and tell me if I am doing something wrong with this platform's habits. Let's make something amazing together!

- **Email**: [contact@jimmm.ai](mailto:contact@jimmm.ai)
- **Twitter**: [@Jimmm_ai](https://x.com/Jimmm_ai)

-------------

## Work in Progress Roadmap for TimeUI: A ComfyUI Timeline Node System

### Introduction
The goal of the TimeUI project is to create an intuitive, user-friendly timeline node system for ComfyUI. This system will streamline the process of creating animations, allowing users to effortlessly add, delete, or rearrange nodes. Below is a detailed roadmap based on feedback and discussions with the community.

### Phase 1: Initial Development and Core Features

#### Milestone 1: Basic Timeline Functionality
- **Create Node System**: Develop the basic structure of the timeline node system.
- **Timeframe Integration**: Enable integration of timeframe values into other nodes.
- **UI/UX Design**: Focus on creating a user-friendly interface with drag-and-drop functionality.
- **Image Upload and Management**: Implement features for uploading images directly into nodes or attaching other "upload image" nodes.

#### Milestone 2: Customization and Settings
- **Row Settings**: Allow customization of each row in the timeline, including visibility toggles for image masks and other settings.
- **Node Independence**: Ensure nodes can work independently or with external nodes.

#### Milestone 3: Time Format and Duration
- **Time Format Options**: Provide options to change the time format and animation duration in frames or seconds.
- **Timeline Ruler Update**: Update the timeline ruler to display the number of frames or seconds each image occupies.

#### Milestone 4: Bezier Curve Feature
- **Bezier Curve Button**: Add a button to view the Bezier curve result of the current timeline.
- **Design and Integration**: Continue designing and integrating the Bezier curve feature.

### Phase 2: Advanced Features and Community Collaboration

#### Milestone 5: Community Feedback and Testing
- **Gather Feedback**: Collect feedback from the community to identify areas of improvement.
- **Testing**: Conduct thorough testing to ensure stability and usability.

#### Milestone 6: Workflow Examples and Documentation
- **Example Workflows**: Create and share example workflows demonstrating how to use the timeline node system.
- **Documentation**: Develop comprehensive documentation to assist users in understanding and utilizing the system.

### Phase 3: Extended Functionality and Enhancements

#### Milestone 7: Integration with Other Workflows
- **AnimateDiff Workflows**: Integrate the timeline node system with AnimateDiff workflows.

#### Milestone 8: Settings Integration and CNet Weight Integration
- **Toggle Settings**: Enable settings like IP adapter, Image Negative, Attn Mask, Clip vision, Mask, and more.
- **Settings Integration**: Integrate these settings directly into the timeline node system for seamless customization.
- **CNet Weight Integration**: Explore adding features like CNet weight integration based on community demand.

#### Milestone 9: Global Feature Implementation
- **Global Settings**: Transition from setting configurations for each image to global settings applicable to the entire timeline.
- **Advanced Customization**: Enhance the system with advanced customization options.

### Phase 4: Finalization and Release

#### Milestone 10: Final Tweaks and Optimization
- **Optimization**: Optimize the node system for performance and efficiency.
- **Final Testing**: Conduct final rounds of testing to ensure all features are functioning as expected.

#### Milestone 11: Official Release
- **Release Preparation**: Prepare for the official release of the TimeUI system.
- **Launch**: Launch the TimeUI system and make it available for the community.

### Ongoing Collaboration and Maintenance

- **Community Support**: Continue to engage with the community for feedback and support.
- **Regular Updates**: Provide regular updates and enhancements based on user feedback and emerging needs.

### Conclusion
The TimeUI project aims to simplify the animation creation process within ComfyUI, making it accessible and efficient for all users. Through collaborative efforts and continuous improvement, we can create a powerful tool that meets the diverse needs of the community.

MIT License