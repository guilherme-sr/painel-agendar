import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { ModalContext, ModalProvider } from "../../contexts/ModalContext";
import CreateMeeting from "./CreateMeeting";
import EditMeeting from "./EditMeeting";

interface ModalProps {
  closeModal: () => void;
  loading: boolean;
  create?: boolean;
  edit?: boolean;
  view?: boolean;
}

const NewMeeting: React.FC<ModalProps> = (props) => {
  const { closeModal, loading, create, edit, view } = props;
  const { modalTitle, changeModalTitle } = useContext(ModalContext);

  useEffect(() => {
    if (create) {
      changeModalTitle("Novo agendamento");
    } else if (edit) {
      changeModalTitle("Editar agendamento");
    } else if (view) {
      changeModalTitle("Visualizar agendamento");
    }
  }, []);

  return (
    <Modal title={modalTitle} onCancel={closeModal} width={450} open>
      {create && <CreateMeeting closeModal={closeModal} />}
      {edit && <EditMeeting closeModal={closeModal} />}
    </Modal>
  );
};

export default NewMeeting;
