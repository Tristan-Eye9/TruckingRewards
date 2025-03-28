To deploy a new version of the lambda:

1. zip all lambda with 7-zip file manager. The windows zip tool is inconsistent at 
best and sometimes AWS thinks it's corrupted.

2. Import the zip into the lambda using the Upload from option, then choose zip

3. Ensure that the file structure looks like:

TEAM22-RDSLAMBDA
| > node_modules
| index.mjs
| package-lock.json
| package.json

If there are ANY issues with the file structure our lambda will fail. This was a big issue
I ran into during setup.

4. Finally, ensure any changes are using the ES module and not the typical js standards. 
I didn't originally intend on using this but a guide threw me into it this way.