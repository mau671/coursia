import { useEffect, useState } from "react"
import { useLocation } from "@tanstack/react-router"
import {
  CircleHelpIcon,
  GridIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsPopover } from "@/components/notifications-popover"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCourseByParams } from "@/lib/course-catalog"
import { getCommunityLabel } from "@/lib/community-catalog"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(new Date())
  const location = useLocation()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString("es-MX", { hour12: false })

  const pathParts = location.pathname.split("/").filter(Boolean)
  const isCoursePath = pathParts[0] === "courses" && pathParts.length >= 6
  const isCommunityPath = pathParts[0] === "communities" && pathParts.length >= 2

  const courseInfo = isCoursePath
    ? getCourseByParams({
        year: pathParts[1],
        periodType: pathParts[2],
        periodNumber: pathParts[3],
        courseCode: pathParts[4],
        groupNumber: pathParts[5],
      })
    : null

  const breadcrumbItems = isCoursePath
    ? [
        { href: "/courses", label: "Cursos" },
        {
          href: location.pathname,
          label: courseInfo
            ? `${courseInfo.title} Grupo ${courseInfo.groupNumber.padStart(2, "0")}`
            : `Curso Grupo ${pathParts[5].padStart(2, "0")}`,
          isCourseLeaf: true,
        },
      ]
    : isCommunityPath
      ? [
          { href: "/", label: "Comunidades" },
          ...pathParts.slice(1).map((segment, index) => ({
            href: `/communities/${pathParts.slice(1, index + 2).join("/")}`,
            label: getCommunityLabel(segment),
          })),
        ]
    : pathParts.map((part, index) => {
        const href = "/" + pathParts.slice(0, index + 1).join("/")
        const label =
          part === "courses"
            ? "Cursos"
            : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")

        return { href, label }
      })

  const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1]

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-3 sm:px-4 md:px-6">
      <div className="min-w-0">
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1

              return (
                <BreadcrumbItem key={item.href + item.label}>
                  <BreadcrumbSeparator />
                  {isLast ? (
                    <BreadcrumbPage>
                      {item.isCourseLeaf && courseInfo ? (
                        <span className="inline-flex items-center gap-2">
                          <span>{courseInfo.title}</span>
                          <Badge variant="secondary">{`Grupo ${courseInfo.groupNumber.padStart(2, "0")}`}</Badge>
                        </span>
                      ) : (
                        item.label
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-[45vw] truncate text-sm font-medium md:hidden">
          {courseInfo ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="truncate">{courseInfo.title}</span>
              <Badge variant="secondary" className="shrink-0">{`G${courseInfo.groupNumber.padStart(2, "0")}`}</Badge>
            </span>
          ) : (
            <span>{lastBreadcrumb?.label ?? "Inicio"}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {mounted && (
          <span className="hidden h-8 items-center rounded-md px-2 text-sm tabular-nums text-muted-foreground md:inline-flex">
            {formattedTime}
          </span>
        )}

        <ModeToggle />

        <Button variant="ghost" size="icon" aria-label="Apps" className="hidden md:inline-flex">
          <GridIcon />
        </Button>

        <NotificationsPopover />

        <Button variant="ghost" size="icon" aria-label="Ayuda" className="hidden md:inline-flex">
          <CircleHelpIcon />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={true}
            render={
              <Button variant="ghost" size="icon" aria-label="Cuenta" className="rounded-full p-0">
                <Avatar>
                  <AvatarFallback>
                    <UserIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="size-9">
                <AvatarFallback>
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">María García</span>
                <span className="text-sm text-muted-foreground">
                  maria@ejemplo.com
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserIcon />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-xs text-muted-foreground">v1.0.0</span>
              <DropdownMenuItem variant="destructive" className="px-2">
                <LogOutIcon />
                Cerrar sesión
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
