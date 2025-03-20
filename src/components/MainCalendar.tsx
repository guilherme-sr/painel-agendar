import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { CalendarProps } from "antd";
import { Calendar, Badge } from "antd";
import axios from "axios";
import qs from "qs";
import { ModalProvider } from "../contexts/ModalContext";
import MainModal from "./Modal/MainModal";

interface DaysOfMonth {
  [key: number]: any[];
}

interface FormatedEvents {
  [key: number]: Event[];
}

const App: React.FC = () => {
  const [monthEvents, setMonthEvents] = useState([]);
  const [formatedEvents, setFormatedEvents] = useState<FormatedEvents>({});
  const [loading, setLoading] = useState(true);
  const dataAtual = dayjs(); // Obter a data atual
  const [mes, setMes] = useState(dataAtual.month() + 1);
  const [ano, setAno] = useState(dataAtual.year());
  const [modalNM, setModalNM] = useState<boolean>(false);
  const [viewId, setViewId] = useState<number>(0);

  useEffect(() => {
    if (monthEvents) {
      const daysOfMonth: DaysOfMonth = {};
      monthEvents.forEach((item: { attributes: { start: string } }) => {
        const day = new Date(item.attributes.start).getDate();
        if (!daysOfMonth[day]) {
          daysOfMonth[day] = [];
        }
        daysOfMonth[day].push(item);
      });
      setFormatedEvents(daysOfMonth);
      setLoading(false);
    }
  }, [monthEvents]);

  const fetchMonthMeetings = async () => {
    try {
      var primeiroDia = dayjs(new Date(ano, mes - 1, 1));
      var ultimoDia = dayjs(new Date(ano, mes, 1));
      const query = qs.stringify({
        sort: "name:ASC",
        filters: {
          $and: [
            {
              start: {
                $gte: primeiroDia.toISOString(),
              },
            },
            {
              start: {
                $lte: ultimoDia.toISOString(),
              },
            },
          ],
        },
        populate: ["room", "creator"],
      });
      const response = await axios.get(
        `http://localhost:1337/api/Meetings?${query}`,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMonthEvents(response.data.data);
    } catch (error) {
      console.error("Erro ao recuperar os dados dos eventos:", error);
    }
  };

  useEffect(() => {
    fetchMonthMeetings();
  }, [mes, ano]);

  const calendarChange = (value: Dayjs) => {
    if (value.month() + 1 !== mes || value.year() !== ano) {
      setMes(value.month() + 1);
      setAno(value.year());
    }
  };

  const handleMeetingClick = (event: any) => {
    console.log("🚀 ~ handleMeetingClick ~ event:", event.id);
    setViewId(event.id);
    setModalNM(true);
  };

  const dateCellRender = (value: Dayjs) => {
    if (value.month() === mes - 1) {
      const listData = formatedEvents[value.date()] || [];

      return (
        <>
          {listData.map((item: any) => (
            <p onClick={() => handleMeetingClick(item)}>
              <Badge
                key={item.attributes.room.data?.attributes.createdAt}
                color={item.attributes.room.data?.attributes.color}
                text={item.attributes.name}
                className="calendar-meeting"
              />
            </p>
          ))}
        </>
      );
    }
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return null;
  };

  const handleModalClose = () => {
    setModalNM(false);
  };

  return (
    <>
      {!loading && (
        <Calendar onChange={calendarChange} cellRender={cellRender} />
      )}
      {modalNM && (
        <ModalProvider>
          <MainModal
            view={viewId}
            loading={false}
            closeModal={handleModalClose}
          />
        </ModalProvider>
      )}
    </>
  );
};

export default App;
