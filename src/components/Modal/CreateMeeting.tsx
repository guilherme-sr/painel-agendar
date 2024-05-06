import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Button,
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
import RoomsContext from "../../contexts/RoomsContext";
import { ModalContext } from "../../contexts/ModalContext";
import { log } from "console";

const dateFormat = "DD-MM-YYYY";

interface ModalProps {
  closeModal: () => void;
}

interface userDataInterface {
  id: number;
}

const CreateMeeting: React.FC<ModalProps> = (props) => {
  const { closeModal } = props;

  const { rooms } = useContext(RoomsContext);
  // const { changeModalTitle } = useContext(ModalContext);

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

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createDate, setCreateDate] = useState(dayjs().toString());
  const [createDuration, setCreateDuration] = useState("");
  const [createParticipants, setCreateParticipants] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  const [userData, setUserData] = useState<userDataInterface>({ id: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.125:1337/api/Users/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao recuperar os dados do usuário:", error);
      }
    };
    fetchUserData();
  }, []);

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
      creator: userData.id,
      end: dayjs(dayjs(meeting.start).add(endMinutes, "minute"))
        .format("YYYY-MM-DD HH:mm:ss")
        .toString(),
      room: getRoomId(meeting.room),
    };
    console.log(final_meeting);
    try {
      const response = await axios.post(
        "http://192.168.1.125:1337/api/meetings",
        {
          data: {
            name: createName,
            description: createDescription,
            start: createDate,
            room: selectedRoom,
            creator: userData.id,
            end: dayjs(dayjs(createDate).add(endMinutes, "minute")),
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

  const handleSelectChange = (value: number) => {
    console.log(`selected ${value}`);
    setSelectedRoom(value);
  };

  return (
    <>
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
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
        </Form.Item>
        <Flex gap="large">
          <Form.Item
            label="Início"
            rules={[
              {
                required: true,
                message: "Insira a data e hora de início!",
              },
            ]}
          >
            <DatePicker
              showTime
              minDate={dayjs(dayjs(), dateFormat)}
              value={dayjs(createDate)}
              onChange={(_, dateString) => {
                setCreateDate(dateString.toString());
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
              value={selectedRoom}
              onChange={handleSelectChange}
              options={rooms.map((room) => {
                return {
                  value: room.id,
                  label: (
                    <span>
                      <span>
                        <XFilled style={{ color: room.attributes.color }} />
                      </span>
                      {" " + room.attributes.name}
                    </span>
                  ),
                };
              })}
            />
          )}
        </Form.Item>
        <Form.Item label="Descrição" name="description">
          <Input.TextArea
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
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
    </>
  );
};

export default CreateMeeting;
