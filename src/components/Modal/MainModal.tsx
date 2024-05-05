import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  message,
  Flex,
} from "antd";
import dayjs from "dayjs";

const dateFormat = "DD-MM-YYYY";

interface ModalProps {
  rooms: { key: string; label: string; icon: string }[];
  closeModal: () => void;
  userId?: number;
  modalTitle: string;
  editName: string;
  editDescription: string;
  editStart: string;
  editEnd: string;
  editRoom: string;
}

const NewMeeting: React.FC<ModalProps> = (props) => {
  const {
    rooms,
    closeModal,
    userId,
    modalTitle,
    editName,
    editDescription,
    editEnd,
    editStart,
    editRoom,
  } = props;

  return (
    <Modal
      title={modalTitle}
      open={true}
      onOk={handleSubmit}
      onCancel={closeModal}
      width={450}
      footer={[
        <Button disabled={loading} key="back" onClick={closeModal}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Salvar
        </Button>,
      ]}
    ></Modal>
  );
};

export default NewMeeting;
