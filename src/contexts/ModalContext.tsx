import { useState, createContext } from "react";

export type ModalProps = {
  modalTitle: string;
  changeModalTitle: (newtitle: string) => void;
  name?: string;
  changeMeetingName?: (newname: string) => void;
  description?: string;
  changeMeetingDescription?: (newdescription: string) => void;
  start?: string;
  changeMeetingStart?: (newstart: string) => void;
  duration?: string;
  changeMeetingDuration?: (newduration: string) => void;
  room?: string;
  changeMeetingRoom?: (newroom: string) => void;
};

const ModalContext = createContext<ModalProps>({} as ModalProps);
function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalTitle, setModalTitle] = useState<string>("");
  const [meetingName, setMeetingName] = useState<string>("");
  const [meetingDescription, setMeetingDescription] = useState<string>("");
  const [meetingStart, setMeetingStart] = useState<string>("");
  const [meetingDuration, setMeetingDuration] = useState<string>("");
  const [meetingRoom, setMeetingRoom] = useState<string>("");

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

  function changeMeetingDuration(newduration: string) {
    setMeetingDuration(newduration);
  }

  function changeMeetingRoom(newroom: string) {
    setMeetingRoom(newroom);
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
        duration: meetingDuration,
        changeMeetingDuration,
        room: meetingRoom,
        changeMeetingRoom,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export { ModalProvider, ModalContext };
