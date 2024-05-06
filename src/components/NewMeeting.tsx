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

const NewMeeting: React.FC<ModalProps> = (props) => {
  const { closeModal, userId } = props;
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

  useEffect(() => {
    if (success) {
      message.open({
        type: "success",
        content: "Agendamento Criado com Sucesso!",
        duration: 7,
      });
      setSuccess(false);
      closeModal();
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      message.open({
        type: "error",
        content: "Falha ao Criar Agendamento",
      });
      setError(false);
    }
  }, [error]);

  const handleKeyDown = (e: any) => {
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
    // Expressão regular para validar o formato do email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const updateMeetingField = (field: any, value: any) => {
    setMeeting((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const removeParticipant = (notParticipant: any) => {
    setParticipants(participants.filter((pt) => pt !== notParticipant));
  };

  const getSelectRooms = (rooms: {
    [x: string]: any;
    hasOwnProperty: (arg0: string) => any;
  }) => {
    for (const key in rooms) {
      if (rooms.hasOwnProperty(key)) {
        const room = rooms[key];
      }
    }
  };

  const getRoomId = (roomKey: string) => {
    const reId = /\d.*$/;
    return reId.exec(roomKey);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(meeting);
    setLoading(true);
    setError(false);
    setSuccess(false);
    const final_meeting = {
      ...meeting,
      creator: userId,
      end: dayjs(dayjs(meeting.start).add(endMinutes, "minute"))
        .format("YYYY-MM-DD HH:mm:ss")
        .toString(),
      room: getRoomId(meeting.room),
    };
    console.log(final_meeting);
    try {
      const response = await axios.post(
        "http://192.168.1.125:1337/api/meetings",
        { data: final_meeting },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);

      setMeeting({
        name: "",
        description: "",
        start: "",
        end: "",
        room: "",
        creator: 0,
      });
      setLoading(false);
      setSuccess(true);
    } catch (error) {
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
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Salvar
        </Button>,
      ]}
    >
      <Form
        name="basic"
        initialValues={{ remember: true }}
        layout="vertical"
        className="form-modal"
      >
        <Form.Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: "Insira o nome do agendamento!" }]}
        >
          <Input
            value={meeting.name}
            onChange={(e) => updateMeetingField("name", e.target.value)}
          />
        </Form.Item>
        <Flex gap="large">
          <Form.Item
            label="Início"
            name="start"
            rules={[
              { required: true, message: "Insira a data e hora de início!" },
            ]}
          >
            <DatePicker
              showTime
              minDate={dayjs(dayjs(), dateFormat)}
              value={meeting.start}
              // defaultValue={"2027-04-04 08:13:00"}

              onChange={(_, dateString) => {
                updateMeetingField("start", dateString);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Duração"
            name="time"
            rules={[
              { required: true, message: "Selecione o tempo de duração!" },
            ]}
          >
            <Select
              value={endMinutes}
              defaultValue={endMinutes}
              onChange={(value) => {
                setEndMinutes(value);
              }}
              options={[
                { value: 15, label: <span>15 min.</span> },
                { value: 30, label: <span>30 min.</span> },
                { value: 60, label: <span>60 min.</span> },
                { value: 90, label: <span>90 min.</span> },
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
            options={rooms.map((room) => {
              return {
                value: room.id,
                label: (
                  <span>
                    <span>
                      <XFilled style={{ color: room.attributes.color }} />
                    </span>
                    {room.attributes.name}
                  </span>
                ),
              };
            })}
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
              <Tag
                key={index}
                closable
                onClose={() => removeParticipant(email)}
              >
                {email}
              </Tag>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewMeeting;
