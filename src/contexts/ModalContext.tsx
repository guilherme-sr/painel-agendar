import { useState, createContext } from "react";

export type ModalProps = {
  modalTitle: string;
  changeModalTitle: (newtitle: string) => void;
  name?: string;
  changeMeetingName: (newname: string) => void;
  description?: string;
  changeMeetingDescription: (newdescription: string) => void;
  start?: string;
  changeMeetingStart: (newstart: string) => void;
  end: string;
  changeMeetingEnd: (newduration: string) => void;
  roomName: string;
  changeMeetingRoomName: (newroom: string) => void;
  roomColor: string;
  changeMeetingRoomColor: (newroom: string) => void;
  viewId: number;
  changeViewId: (newView: number) => void;
  editId: number;
  changeEditId: (newView: number) => void;
};

const ModalContext = createContext<ModalProps>({} as ModalProps);
function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalTitle, setModalTitle] = useState<string>("");
  const [meetingName, setMeetingName] = useState<string>("");
  const [meetingDescription, setMeetingDescription] = useState<string>("");
  const [meetingStart, setMeetingStart] = useState<string>("");
  const [meetingEnd, setMeetingEnd] = useState<string>("");
  const [meetingRoomColor, setMeetingRoomColor] = useState<string>("");
  const [meetingRoomName, setMeetingRoomName] = useState<string>("");
  const [viewId, setViewId] = useState<number>(0);
  const [editId, setEditId] = useState<number>(0);

  function changeModalTitle(newtitle: string) {
    setModalTitle(newtitle);
  }

  function changeMeetingName(newname: string) {
    setMeetingName(newname);
  }

  function changeMeetingDescription(newdescription: string) {
    setMeetingDescription(newdescription);
  }

  function changeMeetingStart(newstart: string) {
    setMeetingStart(newstart);
  }

  function changeMeetingEnd(newduration: string) {
    setMeetingEnd(newduration);
  }

  function changeMeetingRoomColor(newroom: string) {
    setMeetingRoomColor(newroom);
  }

  function changeMeetingRoomName(newroom: string) {
    setMeetingRoomName(newroom);
  }

  function changeViewId(newView: number) {
    setViewId(newView);
  }

  function changeEditId(newView: number) {
    setEditId(newView);
  }

  return (
    <ModalContext.Provider
      value={{
        modalTitle,
        changeModalTitle,
        name: meetingName,
        changeMeetingName,
        description: meetingDescription,
        changeMeetingDescription,
        start: meetingStart,
        changeMeetingStart,
        end: meetingEnd,
        changeMeetingEnd,
        roomName: meetingRoomName,
        changeMeetingRoomName,
        roomColor: meetingRoomColor,
        changeMeetingRoomColor,
        viewId,
        changeViewId,
        editId,
        changeEditId,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export { ModalProvider, ModalContext };
