# Existing Admin image display limitation

The authentic post-sync Admin detail reports captured image unavailable. `fetchCloudRecords` maps the remote image path but omits a local capturedImageId (`src/cloudSync.ts:189`); `AdminRecords` requires capturedImageId or a legacy capturedImage source before rendering StoredEvidenceImage (`src/App.tsx:455`). The cloud upload and byte-identical image readback still pass, and the local IndexedDB evidence retains its ID and Synced state.

Production code was preserved. The final two-second film clip opens the real Grader dashboard local Tail cut record and displays its actual captured image with Synced label, original Grade A confidence and expert Grade B override. The film must not imply the Admin cloud detail displays the uploaded image.

An earlier direct sync from Records also reproduced a revoked blob URL behind the success modal during local-to-cloud replacement (ERR_FILE_NOT_FOUND). The final approved flow leaves Records for the real Audit logs section before Sync now, so no thumbnails are mounted during replacement. Both final viewport runs assert zero unexpected console/network errors and zero revoked-image issues. This preserves the application while documenting the existing display defect.
