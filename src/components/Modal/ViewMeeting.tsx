import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Flex, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { XFilled } from "@ant-design/icons";
import { ModalContext } from "../../contexts/ModalContext";
import qs from "qs";

interface ModalProps {
  closeModal: () => void;
}

const ViewMeeting: React.FC<ModalProps> = () => {
  const {
    name,
    changeMeetingName,
    description,
    changeMeetingDescription,
    start,
    changeMeetingStart,
    end,
    changeMeetingEnd,
    roomName,
    changeMeetingRoomName,
    roomColor,
    changeMeetingRoomColor,
    viewId,
  } = useContext(ModalContext);

  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const populateMeetingView = (meeting: {
    name: string;
    description: string;
    start: string;
    end: string;
    room: { data: { attributes: { name: string; color: string } } };
  }) => {
    changeMeetingName(meeting.name);
    changeMeetingDescription(meeting.description);
    changeMeetingStart(formatDate(meeting.start));
    changeMeetingEnd(meeting.end);
    changeMeetingRoomName(meeting.room.data.attributes.name);
    changeMeetingRoomColor(meeting.room.data.attributes.color);
  };
  useEffect(() => {
    const fetchMeetingData = async () => {
      const query = qs.stringify({
        populate: ["room", "creator", "participants"],
      });
      try {
        console.log("🚀 ~ fetchMeetingData ~ viewId:", viewId);
        const response = await axios.get(
          `http://localhost:1337/api/Meetings/${viewId}?${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        populateMeetingView(response.data.data.attributes);
      } catch (error) {
        console.error("Erro ao recuperar os dados da reunião:", error);
      }
      fetchParticipants();
    };
    const fetchParticipants = async () => {
      const query = qs.stringify({
        filters: {
          meeting: { id: viewId },
        },
      });
      try {
        const response = await axios.get(
          "http://localhost:1337/api/Participants?" + query,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setParticipants(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao recuperar os participantes:", error);
      }
    };
    fetchMeetingData();
  }, [viewId]);

  const formatDate = (date: string) => {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss").toString();
  };

  return (
    <>
      {loading && <Skeleton />}
      {!loading && (
        <Flex vertical>
          <p>
            <b>Agendamento: </b>
            {name}
          </p>
          <Flex>
            <p>
              <b>Sala</b>:
              <XFilled
                style={{
                  color: `${roomColor}`,
                  margin: "0 5px",
                }}
              />
              <span style={{ margin: 0 }}>{roomName}</span>
            </p>
          </Flex>
          <p>
            <b>Data</b>: {dayjs(start).format("DD/MM/YYYY").toString()}
          </p>
          <p>
            <b>Hora de início</b>: {dayjs(start).format("HH:mm").toString()}
          </p>
          <p>
            <b>Hora de término</b>:{dayjs(end).format("HH:mm").toString()}
          </p>
          <p>
            <b>Descrição</b>: {description}
          </p>
          <p>
            <b>Participantes: </b>
          </p>
          <div style={{ marginTop: 10 }}>
            {participants.map((data: any, index) => (
              <Tag key={index}>{data.attributes.email}</Tag>
            ))}
          </div>
        </Flex>
      )}
    </>
  );
};

export default ViewMeeting;
