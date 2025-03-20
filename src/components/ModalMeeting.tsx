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
    closeModal,
    userId,
    modalTitle,
    editName,
    editDescription,
    editEnd,
    editStart,
    editRoom,
  } = props;
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

  const [mName, setMName] = useState("");
  const [mDescription, setMDescription] = useState("");
  const [mStart, setMStart] = useState("");
  const [mEnd, setMEnd] = useState("");
  const [mRoom, setMRoom] = useState("");
  const [mParticipants, setMParticipants] = useState<string[]>([]);

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

  const datetimeToMinutes = () => {
    const start = dayjs(mStart);
    console.log("🚀 ~ datetimeToMinutes ~ dayjs(mStart):", dayjs(mStart));
    console.log("🚀 ~ datetimeToMinutes ~ mStart:", mStart);
    // const end = dayjs(mEnd);
    // const minutes = end.diff(start);
    // console.log(minutes);
    // return minutes;
    return 15;
  };

  useEffect(() => {
    editName && setMName(editName);
    editDescription && setMDescription(editDescription);
    editStart && setMStart(editStart.replace(/Z$/, ""));
    editEnd && setMEnd(editEnd.replace(/Z$/, ""));
    editEnd && setEndMinutes(datetimeToMinutes());
    editRoom && setMRoom(editRoom);
  }, []);

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
        "http://localhost:1337/api/meetings",
        {
          data: {
            name: mName,
            description: mDescription,
            start: mStart,
            room: getRoomId(mRoom),
            creator: userId,
            end: dayjs(dayjs(mStart).add(endMinutes, "minute")),
          },
        },
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
    >
      <Form
        initialValues={{ remember: true }}
        layout="vertical"
        className="form-modal"
      >
        <Form.Item
          label="Nome"
          rules={[{ required: true, message: "Insira o nome do agendamento!" }]}
        >
          <Input
            value={mName}
            onChange={(e) => updateMeetingField("name", e.target.value)}
          />
        </Form.Item>
        <Flex gap="large">
          <Form.Item
            label="Início"
            rules={[
              { required: true, message: "Insira a data e hora de início!" },
            ]}
          >
            <DatePicker
              showTime
              minDate={dayjs(dayjs(), dateFormat)}
              value={dayjs(mStart.replace(/Z$/, ""))}
              defaultValue={dayjs(mStart.replace(/Z$/, ""))}
              onChange={(_, dateString) => {
                setMStart(dateString.toString());
              }}
            />
          </Form.Item>
          <Form.Item
            label="Duração"
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
          rules={[{ required: true, message: "Selecione a sala!" }]}
        >
          {rooms && (
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
          )}
        </Form.Item>
        <Form.Item label="Descrição" name="description">
          <Input.TextArea
            value={mDescription}
            onChange={(e) => setMDescription(e.target.value)}
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
