# cam_folder_cleaner
Node server and worker that cleans unwanted short videos from "motion.py" (server with admin page)

## Development mode!!!

1. Create thumbs on every 1 minute (WORKER) - compare log file (end of event) with db proccesed than -> create new thumbs - database collects videos datas and creates objects -> load data from db first
2. Implement thumbs on preview
3. Add modular play this video (COMPONENT)
4. Add tab 'camera'
5. Move selected videos
6. Delete selected videos
