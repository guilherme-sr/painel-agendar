import React, { useState, useEffect, useContext } from "react";
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
import { XFilled } from "@ant-design/icons";

import RoomsContext from "../contexts/RoomsContext";

const dateFormat = "DD-MM-YYYY";

interface ModalProps {
  closeModal: () => void;
  userId: number;
}

const NewMeeting: React.FC<ModalProps> = ({ closeModal, userId }) => {
  const { rooms } = useContext(RoomsContext);

  const [meeting, setMeeting] = useState({
    name: "",
    description: "",
    start: "",
    end: "",
    room: "",
    creator: 0,
  });

  const [endMinutes, setEndMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (success) {
      message.success("Agendamento Criado com Sucesso!", 7);
      setSuccess(false);
      closeModal();
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      message.error("Falha ao Criar Agendamento");
      setError(false);
    }
  }, [error]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidEmail(currentEmail)) {
      if (!participants.includes(currentEmail)) {
        setParticipants([...participants, currentEmail]);
        setCurrentEmail("");
      } else {
        setCurrentEmail("");
      }
    }
  };

  const isValidEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const updateMeetingField = (field: string, value: any) => {
    setMeeting((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const removeParticipant = (emailToRemove: string) => {
    setParticipants(participants.filter((email) => email !== emailToRemove));
  };

  const getRoomId = (roomKey: string) => {
    const reId = /\d.*$/;
    return reId.exec(roomKey)?.[0] || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setSuccess(false);

    const final_meeting = {
      ...meeting,
      creator: userId,
      end: dayjs(dayjs(meeting.start).add(endMinutes, "minute")).format("YYYY-MM-DD HH:mm:ss"),
      room: getRoomId(meeting.room),
    };

    try {
      // Primeiro, envia a ata se houver
      let uploadedFileUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("files", file);

        const fileUploadResponse = await axios.post("http://localhost:1337/api/upload", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        uploadedFileUrl = fileUploadResponse.data[0]?.url;
      }

      // Em seguida, cria a reunião com ou sem o link da ata
      const payload = {
        ...final_meeting,
        participants,
        ata_url: uploadedFileUrl,
      };

      await axios.post(
        "http://localhost:1337/api/meetings",
        { data: payload },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMeeting({
        name: "",
        description: "",
        start: "",
        end: "",
        room: "",
        creator: 0,
      });
      setFile(null);
      setParticipants([]);
      setLoading(false);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(true);
    }
  };

  return (
    <Modal
      title="Novo Agendamento"
      open={true}
      onOk={handleSubmit}
      onCancel={closeModal}
      width={450}
      footer={[
        <Button disabled={loading} key="back" onClick={closeModal}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Salvar
        </Button>,
      ]}
    >
      <Form layout="vertical" className="form-modal">
        <Form.Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: "Insira o nome do agendamento!" }]}
        >
          <Input value={meeting.name} onChange={(e) => updateMeetingField("name", e.target.value)} />
        </Form.Item>

        <Flex gap="large">
          <Form.Item
            label="Início"
            name="start"
            rules={[{ required: true, message: "Insira a data e hora de início!" }]}
          >
            <DatePicker
              showTime
              format="DD-MM-YYYY HH:mm"
              value={meeting.start ? dayjs(meeting.start, "YYYY-MM-DD HH:mm:ss") : null}
              onChange={(_, dateString) => updateMeetingField("start", dateString)}
            />
          </Form.Item>

          <Form.Item
            label="Duração"
            name="time"
            rules={[{ required: true, message: "Selecione o tempo de duração!" }]}
          >
            <Select
              value={endMinutes}
              onChange={setEndMinutes}
              options={[
                { value: 15, label: "15 min." },
                { value: 30, label: "30 min." },
                { value: 60, label: "60 min." },
                { value: 90, label: "90 min." },
              ]}
            />
          </Form.Item>
        </Flex>

        <Form.Item
          label="Sala"
          name="room"
          rules={[{ required: true, message: "Selecione a sala!" }]}
        >
          <Select
            value={meeting.room}
            onChange={(value) => updateMeetingField("room", value)}
            options={rooms.map((room) => ({
              value: room.id,
              label: (
                <span>
                  <XFilled style={{ color: room.attributes.color }} /> {room.attributes.name}
                </span>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item label="Descrição" name="description">
          <Input.TextArea
            value={meeting.description}
            onChange={(e) => updateMeetingField("description", e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item label="Participantes" name="participants">
          <Input
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ marginTop: 10 }}>
            {participants.map((email, index) => (
              <Tag key={index} closable onClose={() => removeParticipant(email)}>
                {email}
              </Tag>
            ))}
          </div>
        </Form.Item>
        
        <Form.Item label="Ata da reunião (PDF ou Word)">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewMeeting;
