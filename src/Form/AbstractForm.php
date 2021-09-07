<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Form;

use Drjele\Symfony\JsonForm\Contract\DtoInterface;
use Drjele\Symfony\JsonForm\Exception\Exception;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\SerializerInterface;

abstract class AbstractForm
{
    protected SerializerInterface $serializer;

    abstract protected function getDtoClass(): string;

    abstract protected function getRoute(): ?string;

    abstract protected function build(FormBuilder $formBuilder): void;

    final public function setSerializer(SerializerInterface $serializer): self
    {
        $this->serializer = $serializer;

        return $this;
    }

    final public function render(DtoInterface $dto = null): array
    {
        if (null === $dto) {
            $dtoClass = $this->getDtoClass();
            /** @var DtoInterface $dto */
            $dto = new $dtoClass();
        }

        $formName = $this->getName();

        if (\get_class($dto) !== $this->getDtoClass()) {
            throw new Exception(\sprintf('invalid dto class for form "%s"', $formName));
        }

        $formBuilder = new FormBuilder($formName, $this->getRoute());

        $this->build($formBuilder);

        $data = $this->serializer->normalize($dto);

        return $formBuilder->render($data);
    }

    final public function handle(Request $request): DtoInterface
    {
        $data = $this->getData($request);

        return $this->serializer->denormalize($data, $this->getDtoClass());
    }

    private function getData(Request $request): array
    {
        $content = $request->getContent();

        if (empty($content)) {
            return [];
        }

        return (new JsonEncoder())->decode($content, JsonEncoder::FORMAT)[$this->getName()] ?? [];
    }

    private function getName(): string
    {
        $className = \lcfirst((new \ReflectionClass(static::class))->getShortName());

        $position = \strrpos($className, 'Service');

        return false === $position ? $className : \substr($className, 0, $position);
    }
}
