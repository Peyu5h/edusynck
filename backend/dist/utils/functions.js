import { extname } from "path";
import { differenceInDays, differenceInHours, differenceInMinutes, isBefore, } from "date-fns";
export const getFileType = (extension) => {
    const documentTypes = ["doc", "docx", "txt", "rtf", "odt"];
    const spreadsheetTypes = ["xls", "xlsx", "ods"];
    const presentationTypes = ["ppt", "pptx", "odp"];
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp"];
    if (extension === "pdf")
        return "PDF";
    if (documentTypes.includes(extension))
        return "DOCX";
    if (spreadsheetTypes.includes(extension))
        return "XLS";
    if (presentationTypes.includes(extension))
        return "PPT";
    if (imageTypes.includes(extension))
        return "IMG";
    return "PDF";
};
export const organizeAssignmentMaterials = (materials) => {
    if (!materials)
        return { links: [], files: [] };
    const organized = { links: [], files: [] };
    materials.forEach((item) => {
        if (item.link) {
            organized.links.push({
                url: item.link.url,
                title: item.link.title,
                thumbnailUrl: item.link.thumbnailUrl,
            });
        }
        else if (item.driveFile) {
            const file = item.driveFile.driveFile;
            const extension = extname(file.title).toLowerCase().slice(1);
            organized.files.push({
                id: file.id,
                title: file.title,
                alternateLink: file.alternateLink,
                thumbnailUrl: file.thumbnailUrl,
                extension: extension,
                type: getFileType(extension),
            });
        }
    });
    return organized;
};
export const parseDueDate = (dueDate, dueTime) => {
    if (!dueDate || !dueTime)
        return null;
    const { year, month, day } = dueDate;
    const { hours = 0, minutes = 0 } = dueTime;
    return new Date(Date.UTC(year, month - 1, day, hours, minutes));
};
export const formatDueDate = (dueDate) => {
    if (!dueDate)
        return null;
    const now = new Date();
    if (isBefore(dueDate, now)) {
        return "missing";
    }
    const daysDifference = differenceInDays(dueDate, now);
    const hoursDifference = differenceInHours(dueDate, now) % 24;
    const minutesDifference = differenceInMinutes(dueDate, now) % 60;
    if (daysDifference > 0) {
        return `${daysDifference} day${daysDifference > 1 ? "s" : ""}`;
    }
    else if (hoursDifference > 0) {
        return `${hoursDifference} hour${hoursDifference > 1 ? "s" : ""}`;
    }
    else {
        return `${minutesDifference} minute${minutesDifference > 1 ? "s" : ""}`;
    }
};
