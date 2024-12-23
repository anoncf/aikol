// In your router configuration file (e.g., App.jsx or router.jsx)
import { createBrowserRouter } from "react-router-dom";
import Agents from "./Agents";
import Agent from "./Agent";
import Layout from "./Layout";
import Chat from "./Chat";
import Character from "./Character";
import { CharterOverslew } from "@/components/charter-overslew";
import HowToUseLea from './components/how-to-use-lea';
import HowItsBuilt from './components/how-its-built';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Agents />,
            },
            {
                path: "charter",
                element: <CharterOverslew />,
            },
            {
                path: ":agentId",
                children: [
                    {
                        path: "",
                        element: <Agent />,
                    },
                    {
                        path: "chat",
                        element: <Chat />,
                    },
                    {
                        path: "character",
                        element: <Character />,
                    },
                ],
            },
            {
                path: "how-to-use-lea",
                element: <HowToUseLea />,
            },
            {
                path: "how-its-built",
                element: <HowItsBuilt />,
            },
        ],
    },
]);
