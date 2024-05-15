import React, { useContext, useEffect } from "react";
import { Modal } from "antd";
import { ModalContext } from "../../contexts/ModalContext";
import CreateMeeting from "./CreateMeeting";
import EditMeeting from "./EditMeeting";
import ViewMeeting from "./ViewMeeting";

interface ModalProps {
  closeModal: () => void;
  loading: boolean;
  create?: boolean;
  edit?: number;
  view?: number;
}

const NewMeeting: React.FC<ModalProps> = (props) => {
  const { closeModal, create, edit, view } = props;
  const { modalTitle, changeModalTitle, changeViewId, changeEditId } =
    useContext(ModalContext);

  useEffect(() => {
    if (create) {
      changeModalTitle("Novo agendamento");
    } else if (edit) {
      changeModalTitle("Editar agendamento");
      changeEditId(edit);
    } else if (view) {
      changeModalTitle("Visualizar agendamento");
      changeViewId(view);
    }
  }, []);

  return (
    <Modal title={modalTitle} onCancel={closeModal} width={450} open footer>
      {create && <CreateMeeting closeModal={closeModal} />}
      {edit && <EditMeeting closeModal={closeModal} />}
      {view && <ViewMeeting closeModal={closeModal} />}
    </Modal>
  );
};

export default NewMeeting;
